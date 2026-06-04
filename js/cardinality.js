// ===== GESTIÓN DE CARDINALIDAD =====

// Variables globales para cardinalidad
let cardinalityLabels = [];
let cardinalityIdCounter = 1;

// Crear etiqueta de cardinalidad
function createCardinalityLabel(x, y, text = '1:N') {
    return {
        id: 'cardinality_' + cardinalityIdCounter++,
        type: 'cardinalidad',
        x: x,
        y: y,
        width: 50,
        height: 30,
        text: text,
        color: '#ecf0f1',
        textColor: '#2c3e50'
    };
}

// Dibujar etiqueta de cardinalidad
function drawCardinalityLabel(label) {
    // Si está seleccionada, dibujar borde resaltado
    if (selectedEntity && selectedEntity.id === label.id) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3 / scale;
        ctx.strokeRect(label.x - 3, label.y - 3, label.width + 6, label.height + 6);
    }
    
    // Fondo del cuadro
    ctx.fillStyle = label.color;
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 1.5 / scale;
    
    ctx.fillRect(label.x, label.y, label.width, label.height);
    ctx.strokeRect(label.x, label.y, label.width, label.height);
    
    // Texto de cardinalidad
    ctx.fillStyle = label.textColor;
    ctx.font = `bold ${13 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        label.text,
        label.x + label.width / 2,
        label.y + label.height / 2
    );
}