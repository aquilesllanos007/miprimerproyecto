// ===== GESTIÓN DE AGREGACIONES =====

// Variables globales para agregaciones
let aggregations = [];
let aggregationIdCounter = 1;

// Crear agregación (rectángulo redondeado)
function createAggregation(x, y) {
    return {
        id: 'aggregation_' + aggregationIdCounter++,
        type: 'agregacion',
        x: x,
        y: y,
        width: 600,
        height: 280,
        name: 'Agregación_' + (aggregationIdCounter - 1),
        color: 'rgba(236, 240, 241, 0.15)', // Gris muy claro con transparencia
        strokeColor: '#95a5a6', // Gris medio para el borde
        borderRadius: 15 // Radio de las esquinas redondeadas
    };
}

// Dibujar agregación
function drawAggregation(aggregation) {
    const x = aggregation.x;
    const y = aggregation.y;
    const width = aggregation.width;
    const height = aggregation.height;
    const radius = aggregation.borderRadius;
    
    // Si está seleccionada, dibujar borde resaltado
    if (selectedEntity && selectedEntity.id === aggregation.id) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3 / scale;
        drawRoundedRect(x - 3, y - 3, width + 6, height + 6, radius + 3);
        ctx.stroke();
    }
    
    // Dibujar rectángulo redondeado principal
    ctx.fillStyle = aggregation.color;
    ctx.strokeStyle = aggregation.strokeColor;
    ctx.lineWidth = 2 / scale;
    
    drawRoundedRect(x, y, width, height, radius);
    ctx.fill();
    ctx.stroke();
    
    // Texto
    ctx.fillStyle = '#2c3e50'; // Color oscuro para contraste con fondo claro
    ctx.font = `${14 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        aggregation.name,
        x + width / 2,
        y + height / 2
    );
}

// Función auxiliar para dibujar rectángulo redondeado
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}