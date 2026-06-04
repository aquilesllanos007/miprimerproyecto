// ===== GESTIÓN DE ATRIBUTOS =====

// Variables globales para atributos
let attributes = [];
let attributeIdCounter = 1;

// Crear atributo
function createAttribute(x, y, attributeType = 'normal') {
    return {
        id: 'attribute_' + attributeIdCounter++,
        type: 'atributo',
        x: x,
        y: y,
        radiusX: 60,
        radiusY: 23,
        name: getAttributeName(attributeType, attributeIdCounter - 1),
        color: '#2ecc71',
        attributeType: attributeType
    };
}

// Obtener nombre de atributo según tipo
function getAttributeName(attributeType, counter) {
    const names = {
        'normal': 'atributo_',
        'primary-key': 'id_',
        'multivalued': 'múltiple_',
        'derived': 'derivado_'
    };
    return (names[attributeType] || 'atributo_') + counter;
}

// Dibujar atributo
function drawAttribute(attribute) {
    const centerX = attribute.x;
    const centerY = attribute.y;
    
    // Si está seleccionado, dibujar borde resaltado
    if (selectedEntity && selectedEntity.id === attribute.id) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3 / scale;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, attribute.radiusX + 3, attribute.radiusY + 3, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Configurar estilo según tipo
    ctx.fillStyle = attribute.color;
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2 / scale;
    
    // Óvalo principal
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, attribute.radiusX, attribute.radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Dibujar segundo óvalo si es multivaluado
    if (attribute.attributeType === 'multivalued') {
        const offset = 4;
        ctx.beginPath();
        ctx.ellipse(
            centerX, 
            centerY, 
            attribute.radiusX - offset, 
            attribute.radiusY - offset, 
            0, 0, 2 * Math.PI
        );
        ctx.stroke();
    }
    
    // Dibujar borde punteado si es derivado
    if (attribute.attributeType === 'derived') {
        ctx.setLineDash([5 / scale, 5 / scale]);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, attribute.radiusX, attribute.radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Texto
    ctx.fillStyle = '#fff';
    ctx.font = `${14 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Medir ancho del texto para el subrayado
    const textMetrics = ctx.measureText(attribute.name);
    const textWidth = textMetrics.width;
    
    ctx.fillText(attribute.name, centerX, centerY);
    
    // Subrayar si es clave primaria
    if (attribute.attributeType === 'primary-key') {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5 / scale;
        ctx.beginPath();
        ctx.moveTo(centerX - textWidth / 2, centerY + 8 / scale);
        ctx.lineTo(centerX + textWidth / 2, centerY + 8 / scale);
        ctx.stroke();
    }
}