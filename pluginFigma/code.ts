figma.showUI(__html__, { width: 400, height: 600 });

let previousTextStates: { id: string; originalText: string }[] = [];

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'apply-text') {
    const lines = msg.content.trim().split(/\n+/).filter(l => l);
    const cleanLines = lines.map(l => l.replace(/^texto\s*\d+\s*-\s*/, '').trim());

    const blocks = (msg.options && msg.options.uppercase)
      ? cleanLines.map(t => t.toUpperCase())
      : cleanLines;

    const nodes = (msg.options && msg.options.onlySelected)
      ? figma.currentPage.selection.filter(n => n.type === 'TEXT') as TextNode[]
      : figma.currentPage.findAll(n => n.type === 'TEXT' && /^texto\d+$/.test(n.name)) as TextNode[];

    if (nodes.length === 0) {
      figma.notify("Nenhum texto encontrado.");
      figma.ui.postMessage("done");
      return;
    }

    previousTextStates = nodes.map(n => ({ id: n.id, originalText: n.characters }));

    for (const node of nodes) {
      if ("fontName" in node) {
        try {
          const font = typeof node.fontName === "symbol"
            ? node.getRangeFontName(0, 1)
            : node.fontName;
          await figma.loadFontAsync(font);
        } catch (e) {
          console.warn("Erro ao carregar fonte:", e);
        }
      }
    }

    nodes.forEach((n, i) => {
      if (blocks[i]) n.characters = blocks[i];
    });

    const preview = nodes.map((n, i) => ({
      name: n.name,
      applied: blocks[i] || ""
    }));

    figma.ui.postMessage({ type: "preview", data: preview });
    figma.ui.postMessage("done");
    figma.notify("Textos aplicados com sucesso!");
  }

  if (msg.type === 'undo-text') {
    previousTextStates.forEach(({ id, originalText }) => {
      const node = figma.getNodeById(id);
      if (node && node.type === "TEXT") {
        (node as TextNode).characters = originalText;
      }
    });
    figma.ui.postMessage("done");
    figma.notify("Textos restaurados.");
  }
};
