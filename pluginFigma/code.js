figma.showUI(__html__, { 
  width: 460, 
  height: 700,
  themeColors: true
});

let previousTextStates = [];

figma.ui.onmessage = async (msg) => {
  console.log('📨 Figma Plugin: Mensagem recebida:', msg.type, msg);
  
  if (msg.type === 'get-fonts') {
    try {
      const fonts = await figma.listAvailableFontsAsync();
      const fontNames = fonts.map(font => font.fontName.family);
      const uniqueFonts = [...new Set(fontNames)].sort();
      
      figma.ui.postMessage({
        type: "font-list",
        fonts: uniqueFonts
      });
    } catch (error) {
      console.error('Erro ao buscar fontes:', error);
      figma.ui.postMessage({
        type: "font-list", 
        fonts: ['Inter', 'Arial', 'Helvetica', 'Roboto'] // fallback
      });
    }
  }

  if (msg.type === 'get-frames-mae') {
    try {
      // Buscar apenas frames principais (não componentes ou instâncias aninhadas)
      const frames = figma.currentPage.findAll(n => 
        n.type === 'FRAME' && 
        n.parent === figma.currentPage && // Apenas frames diretos da página
        !n.name.startsWith('_') && // Excluir frames privados que começam com _
        n.visible !== false // Apenas frames visíveis
      );
      
      const frameNames = frames
        .map(f => f.name)
        .filter(name => name && name.trim() !== '') // Filtrar nomes vazios
        .sort(); // Ordenar alfabeticamente
      
      console.log('🖼️ Figma Plugin: Frames principais encontrados:', frameNames);
      
      figma.ui.postMessage({
        type: "frames-mae-list",
        frames: frameNames
      });
    } catch (error) {
      console.error('Erro ao buscar frames:', error);
      figma.ui.postMessage({
        type: "frames-mae-list",
        frames: []
      });
    }
  }

  if (msg.type === 'get-children') {
    try {
      const parentFrame = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === msg.frameName);
      if (parentFrame) {
        const children = parentFrame.children
          .filter(n => 
            n.type === 'FRAME' && 
            !n.name.startsWith('_') && // Excluir frames privados
            n.visible !== false && // Apenas frames visíveis
            n.name && n.name.trim() !== '' // Nomes válidos
          )
          .map(f => f.name)
          .sort(); // Ordenar alfabeticamente
        
        console.log('👶 Figma Plugin: Frames filhos encontrados para', msg.frameName, ':', children);
        
        figma.ui.postMessage({
          type: "children-list",
          children: children
        });
      } else {
        console.log('❌ Figma Plugin: Frame pai não encontrado:', msg.frameName);
        figma.ui.postMessage({
          type: "children-list",
          children: []
        });
      }
    } catch (error) {
      console.error('Erro ao buscar filhos:', error);
      figma.ui.postMessage({
        type: "children-list",
        children: []
      });
    }
  }

  if (msg.type === 'edit-text-style') {
    try {
      console.log('🎨 Figma Plugin: Recebeu edit-text-style:', msg);
      
      // Buscar o frame pai
      console.log('🔍 Figma Plugin: Buscando frame pai:', msg.parentName);
      const parentFrame = msg.parentName ? figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === msg.parentName) : null;
      console.log('👨‍👦 Figma Plugin: Frame pai encontrado:', parentFrame ? parentFrame.name : 'não encontrado');
      
      let textNodes = [];
      
      if (msg.frameName && parentFrame) {
        // Buscar textos dentro do frame específico
        console.log('🔍 Figma Plugin: Buscando frame filho:', msg.frameName);
        const targetFrame = parentFrame.children.find(n => n.type === 'FRAME' && n.name === msg.frameName);
        console.log('👶 Figma Plugin: Frame filho encontrado:', targetFrame ? targetFrame.name : 'não encontrado');
        
        if (targetFrame) {
          textNodes = targetFrame.findAll(n => n.type === 'TEXT');
          console.log('📝 Figma Plugin: Textos no frame filho:', textNodes.map(t => t.name));
        }
      } else {
        // Buscar todos os textos da página
        console.log('🌐 Figma Plugin: Buscando todos os textos da página');
        textNodes = figma.currentPage.findAll(n => n.type === 'TEXT');
        console.log('📝 Figma Plugin: Todos os textos da página:', textNodes.map(t => t.name));
      }

      console.log('📊 Figma Plugin: Total de textos encontrados:', textNodes.length);

      // Verificar se há algo válido para aplicar
      const hasValidChanges = (msg.color && msg.color !== '#000000') || 
                             (msg.size && msg.size > 0) || 
                             (msg.font && msg.font.trim() !== '');
      
      if (!hasValidChanges) {
        console.log('⚠️ Figma Plugin: Nenhuma alteração válida de texto especificada');
        figma.notify('Nenhuma alteração de texto foi especificada');
        return;
      }

      for (const textNode of textNodes) {
        try {
          console.log('🔤 Figma Plugin: Processando texto:', textNode.name, textNode.characters.substring(0, 30));
          
          // Aplicar cor do texto apenas se especificada e diferente da cor padrão
          if (msg.color && msg.color !== '#000000') {
            const hex = msg.color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;
            
            console.log('🎨 Figma Plugin: Aplicando cor RGB:', { r, g, b });
            
            textNode.fills = [{
              type: 'SOLID',
              color: { r, g, b }
            }];
            
            console.log('✅ Figma Plugin: Cor aplicada com sucesso no texto:', textNode.name);
          }

          // Aplicar tamanho da fonte apenas se especificado e válido
          if (msg.size && msg.size > 0 && msg.size !== 75) { // 75 é o valor padrão
            console.log('📏 Figma Plugin: Aplicando tamanho:', msg.size);
            textNode.fontSize = msg.size;
            console.log('✅ Figma Plugin: Tamanho aplicado com sucesso');
          }

          // Por último, tentar aplicar fonte apenas se especificada e válida
          if (msg.font && msg.font.trim() !== '') {
            try {
              // Carregar fonte atual primeiro
              const currentFont = textNode.fontName;
              await figma.loadFontAsync(currentFont);

              // Tentar aplicar nova fonte
              const newFont = {
                family: msg.font,
                style: msg.weight || 'Regular'
              };
              
              console.log('🔤 Figma Plugin: Tentando carregar fonte:', newFont);
              await figma.loadFontAsync(newFont);
              textNode.fontName = newFont;
              console.log('✅ Figma Plugin: Fonte aplicada com sucesso:', newFont);
              
            } catch (fontError) {
              console.warn('⚠️ Figma Plugin: Erro ao carregar fonte, mantendo a atual:', fontError);
              
              // Tentar variações da fonte
              const alternativeFonts = [
                { family: msg.font, style: 'Bold' },
                { family: msg.font, style: 'Medium' },
                { family: msg.font, style: 'Regular' },
                { family: 'Inter', style: 'Bold' },
                { family: 'Inter', style: 'Medium' },
                { family: 'Inter', style: 'Regular' }
              ];
              
              for (const altFont of alternativeFonts) {
                try {
                  await figma.loadFontAsync(altFont);
                  textNode.fontName = altFont;
                  console.log('✅ Figma Plugin: Fonte alternativa aplicada:', altFont);
                  break;
                } catch (altError) {
                  console.log('🔄 Figma Plugin: Tentativa de fonte alternativa falhou:', altFont);
                }
              }
            }
          }

        } catch (error) {
          console.error('❌ Figma Plugin: Erro geral ao processar texto:', textNode.name, error);
        }
      }

      figma.notify(`Estilo aplicado a ${textNodes.length} textos!`);
    } catch (error) {
      console.error('Erro geral ao aplicar estilo:', error);
      figma.notify('Erro ao aplicar estilo de texto');
    }
  }

  if (msg.type === 'edit-frame') {
    try {
      console.log('🖼️ Figma Plugin: Recebeu edit-frame:', msg);
      
      // Buscar o frame pai
      console.log('🔍 Figma Plugin: Buscando frame pai para fundo:', msg.parentName);
      const parentFrame = msg.parentName ? figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === msg.parentName) : null;
      console.log('👨‍👦 Figma Plugin: Frame pai para fundo encontrado:', parentFrame ? parentFrame.name : 'não encontrado');
      
      let targetFrame = null;
      
      if (msg.frameName && parentFrame) {
        // Buscar frame específico dentro do pai
        console.log('🔍 Figma Plugin: Buscando frame filho para fundo:', msg.frameName);
        targetFrame = parentFrame.children.find(n => n.type === 'FRAME' && n.name === msg.frameName);
        console.log('👶 Figma Plugin: Frame filho para fundo encontrado:', targetFrame ? targetFrame.name : 'não encontrado');
      } else if (msg.frameName) {
        // Buscar frame na página
        console.log('🌐 Figma Plugin: Buscando frame na página para fundo:', msg.frameName);
        targetFrame = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === msg.frameName);
        console.log('🔍 Figma Plugin: Frame na página encontrado:', targetFrame ? targetFrame.name : 'não encontrado');
      }

      if (targetFrame && msg.color) {
        const hex = msg.color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        
        console.log('🎨 Figma Plugin: Aplicando cor de fundo RGB:', { r, g, b }, 'no frame:', targetFrame.name);
        
        targetFrame.fills = [{
          type: 'SOLID',
          color: { r, g, b }
        }];

        figma.notify(`Cor de fundo aplicada no frame: ${targetFrame.name}!`);
      } else {
        const problema = !targetFrame ? 'Frame não encontrado' : 'Cor não especificada';
        console.error('❌ Figma Plugin: Erro ao aplicar fundo:', problema);
        figma.notify(`Erro: ${problema}`);
      }
    } catch (error) {
      console.error('Erro ao aplicar cor de fundo:', error);
      figma.notify('Erro ao aplicar cor de fundo');
    }
  }

  if (msg.type === 'replace-images') {
    try {
      console.log('🖼️ Substituindo imagens:', msg);
      
      // Buscar o frame pai
      const parentFrame = msg.parentName ? figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === msg.parentName) : null;
      
      let targetFrame = null;
      
      if (msg.frameName && parentFrame) {
        // Buscar frame específico dentro do pai
        targetFrame = parentFrame.children.find(n => n.type === 'FRAME' && n.name === msg.frameName);
      } else if (msg.frameName) {
        // Buscar frame na página
        targetFrame = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === msg.frameName);
      }

      if (targetFrame && msg.images && msg.images.length > 0) {
        // Buscar todas as imagens dentro do frame
        const imageNodes = targetFrame.findAll(n => 
          (n.type === 'RECTANGLE' || n.type === 'ELLIPSE' || n.type === 'FRAME') && 
          n.fills && 
          n.fills.length > 0 && 
          n.fills.some(fill => fill.type === 'IMAGE')
        );

        console.log('🖼️ Nós com imagem encontrados:', imageNodes.length);

        for (let i = 0; i < Math.min(imageNodes.length, msg.images.length); i++) {
          try {
            const imageData = msg.images[i];
            // Remover o prefixo data:image/...;base64,
            const base64Data = imageData.split(',')[1];
            const uint8Array = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            
            const image = figma.createImage(uint8Array);
            
            imageNodes[i].fills = [{
              type: 'IMAGE',
              imageHash: image.hash,
              scaleMode: 'FILL'
            }];
          } catch (error) {
            console.error('Erro ao processar imagem:', error);
          }
        }

        figma.notify(`${Math.min(imageNodes.length, msg.images.length)} imagens substituídas!`);
      } else {
        figma.notify('Frame ou imagens não encontradas');
      }
    } catch (error) {
      console.error('Erro ao substituir imagens:', error);
      figma.notify('Erro ao substituir imagens');
    }
  }

  if (msg.type === 'apply-text') {
    const lines = msg.content.trim().split(/\n+/).filter(l => l);
    // Remover numeração "texto X -" dos blocos antes de aplicar
    const cleanedLines = lines.map(line => line.replace(/^texto\s*\d+\s*[-–]\s*/i, '').trim());
    
    const blocks = (msg.options && msg.options.uppercase)
      ? cleanedLines.map(t => t.toUpperCase())
      : cleanedLines;

    const nodes = (msg.options && msg.options.onlySelected)
      ? figma.currentPage.selection.filter(n => n.type === 'TEXT')
      : figma.currentPage.findAll(n => n.type === 'TEXT' && /^texto\d+$/.test(n.name));

    // Debug: vamos ver quais nós foram encontrados
    console.log('🔍 Nós texto encontrados:', nodes.map(n => ({ name: n.name, chars: n.characters.substring(0, 30) })));
    console.log('📝 Blocos originais:', lines);
    console.log('📝 Blocos limpos a aplicar:', blocks);

    if (nodes.length === 0) {
      figma.notify("Nenhum texto encontrado. Certifique-se de que os objetos texto se chamem 'texto1', 'texto2', etc.");
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
        node.characters = originalText;
      }
    });
    figma.ui.postMessage("done");
    figma.notify("Textos restaurados.");
  }
}; 