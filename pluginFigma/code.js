figma.showUI(__html__, { width: 500, height: 800 });

figma.ui.onmessage = async (msg) => {
  const data = msg.pluginMessage || msg;
  if (!data || !data.type) return;

  if (data.type === "apply-text") {
    const lines = data.content.trim().split(/\n+/);
    const blocks = lines.map(l => l.replace(/^texto\s*\d+\s*-\s*/, '').trim()).filter(Boolean);

    const nodes = (data.options && data.options.onlySelected)
      ? figma.currentPage.selection.filter(n => n.type === 'TEXT')
      : figma.currentPage.findAll(n => n.type === 'TEXT' && /^texto\d+$/.test(n.name));

    if (nodes.length === 0) {
      figma.notify("Nenhuma camada de texto encontrada.");
      figma.ui.postMessage("done");
      return;
    }

    for (const node of nodes) {
      if ("fontName" in node) {
        try {
          const font = typeof node.fontName === "symbol" ? node.getRangeFontName(0, 1) : node.fontName;
          await figma.loadFontAsync(font);
        } catch (e) {
          console.warn("Erro ao carregar fonte:", e);
        }
      }
    }

    nodes.forEach((n, i) => {
      if (blocks[i]) {
        const textoFinal = (data.options && data.options.uppercase)
          ? blocks[i].toUpperCase()
          : blocks[i];
        n.characters = textoFinal;
      }
    });

    figma.ui.postMessage("done");
    figma.notify("Textos aplicados com sucesso!");
  }

  if (data.type === "edit-text-style") {
    const { font, weight, size, color, frameName, parentName } = data;

    const parentFrame = figma.currentPage.findOne(n => 
      n.type === 'FRAME' && n.name === parentName
    );

    let scope = null;

    if (parentFrame && parentFrame.children) {
      scope = parentFrame.children.find(n =>
        n.type === 'FRAME' && n.name === frameName
      );
    }

    if (!scope) {
      figma.notify("Frame filho não encontrado: " + frameName);
      return;
    }

    const nodes = scope.findAll(n => n.type === 'TEXT');

    for (const node of nodes) {
      if (node.type === 'TEXT') {
        try {
          let fontName = null;
          if (font && weight && font.trim() !== "") {
            fontName = { family: font.trim(), style: weight };
          } else {
            fontName = node.getRangeFontName(0, 1);
          }

          await figma.loadFontAsync(fontName);
          node.fontName = fontName;

          if (size) node.fontSize = size;

          if (color && color.trim() !== "" && color !== "#ffffff") {
            const currentFills = clone(node.fills || []);
            const baseFill = clone(currentFills[0] || {});
            baseFill.type = "SOLID";
            baseFill.color = hexToRgb(color);
            baseFill.opacity = 1;
            currentFills[0] = baseFill;
            node.fills = currentFills;
          }

        } catch (e) {
          console.warn("Erro ao aplicar estilo:", e);
        }
      }
    }
    figma.notify("Estilo aplicado no frame: " + frameName);
  }

  if (data.type === "edit-frame") {
    const parentFrame = figma.currentPage.findOne(n => 
      n.type === 'FRAME' && n.name === data.parentName
    );

    let targetFrame = null;

    if (parentFrame && parentFrame.children) {
      targetFrame = parentFrame.children.find(n =>
        n.type === 'FRAME' && n.name === data.frameName
      );
    }

    if (targetFrame && "fills" in targetFrame && data.color && data.color.trim() !== "" && data.color !== "#ffffff") {

      try {
        const fills = JSON.parse(JSON.stringify(targetFrame.fills));
        fills[0] = { type: "SOLID", color: hexToRgb(data.color) };
        targetFrame.fills = fills;
        figma.notify("Cor de fundo aplicada!");
      } catch (e) {
        console.warn("Erro ao alterar fundo:", e);
      }
    } else {
      figma.notify("Frame para aplicar fundo não encontrado ou sem cor.");
    }
  }

  if (data.type === "replace-images") {
    const frame = figma.currentPage.findOne(n =>
      n.type === 'FRAME' &&
      n.name === data.frameName &&
      n.parent &&
      n.parent.type === 'FRAME' &&
      n.parent.name === data.parentName
    );

    if (!frame) return figma.notify("Frame não encontrado: " + data.frameName);

    const images = data.images;
    let index = 0;
    const targets = frame.findAll(n =>
      'fills' in n &&
      Array.isArray(n.fills) &&
      n.fills.length > 0 &&
      n.fills[0].type === 'IMAGE'
    );

    for (const node of targets) {
      if (index >= images.length) break;

      const bytes = await fetch(images[index]).then(r => r.arrayBuffer());
      const img = figma.createImage(new Uint8Array(bytes));

      if (typeof node.resize === "function") {
        const width = node.parent && node.parent.width ? node.parent.width : node.width;
        const height = node.parent && node.parent.height ? node.parent.height : node.height;
        node.resize(width, height);
      }
      node.x = 0;
      node.y = 0;

      node.fills = [];
      node.fills = [{
        type: "IMAGE",
        scaleMode: "FILL",
        imageHash: img.hash
      }];

      index++;
    }
    figma.notify("Imagens substituídas com sucesso no frame: " + data.frameName);
  }

  if (data.type === "get-children") {
    const frame = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === data.frameName);
    const children = (frame && "children" in frame) ? frame.children.filter(c => c.type === "FRAME").map(c => c.name) : [];
    figma.ui.postMessage({ type: "children-list", children });
  }

  if (data.type === "get-frames-mae") {
    const framesMae = figma.currentPage.children
      .filter(n => n.type === "FRAME")
      .map(f => f.name);
    figma.ui.postMessage({ type: "frames-mae-list", frames: framesMae });
  }

  if (data.type === "get-fonts") {
    const fonts = await figma.listAvailableFontsAsync();
    const families = [...new Set(fonts.map(f => f.fontName.family))].sort();
    figma.ui.postMessage({ type: "font-list", fonts: families });
  }
};

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255
  };
}

function clone(val) {
  return JSON.parse(JSON.stringify(val));
}
