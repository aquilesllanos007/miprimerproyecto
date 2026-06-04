// ===== GESTIÓN DE RELACIONES =====

// Variables globales para relaciones
let relationships = [];
let relationshipIdCounter = 1;

// Crear relación
function createRelationship(x, y, isWeak = false) {
    return {
        id: 'relationship_' + relationshipIdCounter++,
        type: 'relacion',
        x: x,
        y: y,
        width: 100,
        height: 80,
        name: (isWeak ? 'relaciónDébil_' : 'relación_') + (relationshipIdCounter - 1),
        color: '#f39c12',
        weak: isWeak
    };
}

// Dibujar relación
function drawRelationship(relationship) {
    const centerX = relationship.x;
    const centerY = relationship.y;
    const halfWidth = relationship.width / 2;
    const halfHeight = relationship.height / 2;
    
    // Si está seleccionada, dibujar borde resaltado
    if (selectedEntity && selectedEntity.id === relationship.id) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3 / scale;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - halfHeight - 3);
        ctx.lineTo(centerX + halfWidth + 3, centerY);
        ctx.lineTo(centerX, centerY + halfHeight + 3);
        ctx.lineTo(centerX - halfWidth - 3, centerY);
        ctx.closePath();
        ctx.stroke();
    }
    
    // Dibujar rombo principal
    ctx.fillStyle = relationship.color;
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 2 / scale;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - halfHeight);
    ctx.lineTo(centerX + halfWidth, centerY);
    ctx.lineTo(centerX, centerY + halfHeight);
    ctx.lineTo(centerX - halfWidth, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Si es débil, dibujar segundo rombo interno
    if (relationship.weak) {
        const offset = 6;
        const innerHalfWidth = halfWidth - offset;
        const innerHalfHeight = halfHeight - offset;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - innerHalfHeight);
        ctx.lineTo(centerX + innerHalfWidth, centerY);
        ctx.lineTo(centerX, centerY + innerHalfHeight);
        ctx.lineTo(centerX - innerHalfWidth, centerY);
        ctx.closePath();
        ctx.stroke();
    }
    
    // Texto
    ctx.fillStyle = '#fff';
    ctx.font = `${14 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(relationship.name, centerX, centerY);
}