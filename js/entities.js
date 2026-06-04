// ===== GESTIÓN DE ENTIDADES =====

// Variables globales para entidades
let entities = [];
let entityIdCounter = 1;

// Crear entidad
function createEntity(x, y, isWeak = false) {
    return {
        id: 'entity_' + entityIdCounter++,
        type: 'entidad',
        x: x,
        y: y,
        width: 120,
        height: 45,
        name: (isWeak ? 'EntidadDébil_' : 'Entidad_') + (entityIdCounter - 1),
        color: '#3498db',
        weak: isWeak
    };
}

// Dibujar entidad
function drawEntity(entity) {
    // Si está seleccionada, dibujar borde resaltado
    if (selectedEntity && selectedEntity.id === entity.id) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3 / scale;
        ctx.strokeRect(entity.x - 3, entity.y - 3, entity.width + 6, entity.height + 6);
    }
    
    ctx.fillStyle = entity.color;
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2 / scale;
    
    // Rectángulo principal
    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
    
    // Si es débil, dibujar segundo rectángulo interno
    if (entity.weak) {
        const offset = 4;
        ctx.strokeRect(
            entity.x + offset, 
            entity.y + offset, 
            entity.width - offset * 2, 
            entity.height - offset * 2
        );
    }
    
    // Texto
    ctx.fillStyle = '#fff';
    ctx.font = `${14 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        entity.name, 
        entity.x + entity.width / 2, 
        entity.y + entity.height / 2
    );
}