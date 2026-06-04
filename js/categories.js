// ===== GESTIÓN DE CATEGORÍAS (UNION TYPE) =====

// Variables globales para categorías
let categories = [];
let categoryIdCounter = 1;

// Crear categoría (círculo con U)
function createCategory(x, y) {
    return {
        id: 'category_' + categoryIdCounter++,
        type: 'categoria',
        x: x,
        y: y,
        radius: 25,
        label: 'U',
        color: '#e67e22', // Naranja
        strokeColor: '#d35400'
    };
}

// Dibujar categoría
function drawCategory(category) {
    const centerX = category.x;
    const centerY = category.y;
    const radius = category.radius;
    
    // Si está seleccionada, dibujar borde resaltado
    if (selectedEntity && selectedEntity.id === category.id) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3 / scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 3, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Dibujar círculo principal
    ctx.fillStyle = category.color;
    ctx.strokeStyle = category.strokeColor;
    ctx.lineWidth = 2 / scale;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Dibujar letra "U" en el centro
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${20 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(category.label, centerX, centerY);
}

// Detectar si un punto está dentro del círculo de categoría
function isPointInCategory(px, py, category) {
    const dx = px - category.x;
    const dy = py - category.y;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared <= (category.radius * category.radius);
}