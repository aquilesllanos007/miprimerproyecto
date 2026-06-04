// ===== GESTIÓN DE JERARQUÍAS ISA =====

// Variables globales para jerarquías
let hierarchies = [];
let hierarchyIdCounter = 1;

// Tipos de jerarquía
const HIERARCHY_TYPES = {
    TOTAL_EXCLUSIVE: 'total_exclusive',      // Línea doble + d + curva
    TOTAL_OVERLAPPING: 'total_overlapping',  // Línea doble + o + sin curva
    PARTIAL_EXCLUSIVE: 'partial_exclusive',  // Línea simple + d + curva
    PARTIAL_OVERLAPPING: 'partial_overlapping' // Línea simple + o + sin curva
};

// Crear jerarquía ISA
function createHierarchy(x, y, hierarchyType) {
    const config = getHierarchyConfig(hierarchyType);
    
    return {
        id: 'hierarchy_' + hierarchyIdCounter++,
        type: 'jerarquia',
        x: x,
        y: y,
        width: 60,
        height: 50,
        hierarchyType: hierarchyType,
        label: config.label,
        hasArc: config.hasArc,
        color: '#9b59b6'
    };
}

// Obtener configuración según tipo de jerarquía
function getHierarchyConfig(hierarchyType) {
    switch(hierarchyType) {
        case HIERARCHY_TYPES.TOTAL_EXCLUSIVE:
            return { label: 'd', hasArc: true, isTotal: true };
        case HIERARCHY_TYPES.TOTAL_OVERLAPPING:
            return { label: 'o', hasArc: false, isTotal: true };
        case HIERARCHY_TYPES.PARTIAL_EXCLUSIVE:
            return { label: 'd', hasArc: true, isTotal: false };
        case HIERARCHY_TYPES.PARTIAL_OVERLAPPING:
            return { label: 'o', hasArc: false, isTotal: false };
        default:
            return { label: 'd', hasArc: true, isTotal: false };
    }
}

// Dibujar jerarquía ISA
// Dibujar jerarquía ISA
function drawHierarchy(hierarchy) {
    const centerX = hierarchy.x;
    const centerY = hierarchy.y;
    const width = hierarchy.width;
    const height = hierarchy.height;
    const config = getHierarchyConfig(hierarchy.hierarchyType);
    
    // Si está seleccionada, dibujar borde resaltado
    if (selectedEntity && selectedEntity.id === hierarchy.id) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3 / scale;
        
        // Borde del triángulo
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + height/2 + 3); // Vértice inferior
        ctx.lineTo(centerX - width/2 - 3, centerY - height/2 - 3); // Superior izquierdo
        ctx.lineTo(centerX + width/2 + 3, centerY - height/2 - 3); // Superior derecho
        ctx.closePath();
        ctx.stroke();
    }
    
    // Dibujar triángulo INVERTIDO (▽ - vértice hacia abajo)
    ctx.fillStyle = hierarchy.color;
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = 2 / scale;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + height/2); // Vértice INFERIOR (abajo)
    ctx.lineTo(centerX - width/2, centerY - height/2); // Vértice superior izquierdo
    ctx.lineTo(centerX + width/2, centerY - height/2); // Vértice superior derecho
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // DIBUJAR SÍMBOLO ARRIBA (bolita para Total, línea para Parcial)
    const topY = centerY - height/2;
    const symbolY = topY - 12 / scale;
    
    //ctx.strokeStyle = '#8e44ad';
    //ctx.fillStyle = '#8e44ad';
    
    if (config.isTotal) {
        // BOLITA (círculo relleno) para jerarquías TOTALES
        /*ctx.beginPath();
        ctx.arc(centerX, symbolY, 4 / scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 1 / scale;
        ctx.stroke();*/
        // BOLITA BLANCA (círculo con borde) para jerarquías TOTALES
        // NO hay línea de conexión
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        ctx.arc(centerX, symbolY, 5 / scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    } else {
        // LÍNEA CORTA PERPENDICULAR para jerarquías PARCIALES
        ctx.lineWidth = 2 / scale;
        const lineHalfWidth = 8 / scale;
        ctx.beginPath();
        ctx.moveTo(centerX - lineHalfWidth, symbolY);
        ctx.lineTo(centerX + lineHalfWidth, symbolY);
        ctx.stroke();
    }
    
    // Línea vertical que conecta el símbolo con el triángulo
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = 2 / scale;
    ctx.beginPath();
    ctx.moveTo(centerX, symbolY + 4 / scale);
    ctx.lineTo(centerX, topY);
    ctx.stroke();
    
    // Dibujar semicírculo (curva) DEBAJO si es EXCLUSIVA
    if (config.hasArc) {
        const arcRadius = width / 1.5;
        //const arcCenterY = centerY + height/2 + arcRadius - 2;
        const bottomY = centerY // + height/12;
        const arcCenterY = bottomY; // Centro del arco en el vértice
        
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        ctx.arc(
            centerX, 
            arcCenterY, 
            arcRadius, 
            0,  // Ángulo inicial (0° = derecha)
            Math.PI, // Ángulo final (180° = izquierda)
            false
        );
        ctx.stroke();
    }
    
    // Dibujar letra (d u o) en el centro del triángulo
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${16 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.label, centerX, centerY);
}
// Detectar si un punto está dentro del triángulo de jerarquía
function isPointInHierarchyTriangle(px, py, hierarchy) {
    const cx = hierarchy.x;
    const cy = hierarchy.y;
    const w = hierarchy.width;
    const h = hierarchy.height;
    
    // Vértices del triángulo
    const x1 = cx, y1 = cy - h/2; // Superior
    const x2 = cx - w/2, y2 = cy + h/2; // Inferior izquierdo
    const x3 = cx + w/2, y3 = cy + h/2; // Inferior derecho
    
    // Algoritmo de área para punto en triángulo
    const areaOrig = Math.abs((x2-x1)*(y3-y1) - (x3-x1)*(y2-y1));
    const area1 = Math.abs((x1-px)*(y2-py) - (x2-px)*(y1-py));
    const area2 = Math.abs((x2-px)*(y3-py) - (x3-px)*(y2-py));
    const area3 = Math.abs((x3-px)*(y1-py) - (x1-px)*(y3-py));
    
    return Math.abs(areaOrig - (area1 + area2 + area3)) < 0.01;
}