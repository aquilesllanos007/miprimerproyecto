// ===== FUNCIONES COMPARTIDAS Y UTILIDADES =====

// Obtener centro de un elemento (entidad, atributo, relación, categoría)
function getElementCenter(element) {
    if (element.type === 'entidad') {
        return {
            x: element.x + element.width / 2,
            y: element.y + element.height / 2
        };
    } else if (element.type === 'atributo') {
        return {
            x: element.x,
            y: element.y
        };
    } else if (element.type === 'relacion') {
        return {
            x: element.x,
            y: element.y
        };
    } else if (element.type === 'cardinalidad') {
        return {
            x: element.x + element.width / 2,
            y: element.y + element.height / 2
        };
    } else if (element.type === 'jerarquia') {
        // Punto de conexión en el centro del triángulo
        return {
            x: element.x,
            y: element.y
        };
    } else if (element.type === 'categoria') {
        return {
            x: element.x,
            y: element.y
        };
    } else if (element.type === 'agregacion') {
        return {
            x: element.x + element.width / 2,
            y: element.y + element.height / 2
        };
    } else if (element.type === 'restriccion') {
        // Para arcos arrastrables (exclusividad e inclusividad)
        if (element.constraintType === 'exclusivity' || element.constraintType === 'inclusivity') {
            return {
                x: element.x,
                y: element.y
            };
        }
    }
}

// Detectar si un punto está dentro de un rombo
function isPointInDiamond(px, py, cx, cy, width, height) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const dx = Math.abs(px - cx);
    const dy = Math.abs(py - cy);
    return (dx / halfWidth + dy / halfHeight) <= 1;
}

// Obtener elemento (entidad, atributo, relación, cardinalidad, jerarquía o categoría) en una posición
function getElementAtPosition(x, y) {
    const canvasX = (x - offsetX) / scale;
    const canvasY = (y - offsetY) / scale;
    
    // Verificar categorías (círculos con U) - primero para facilitar selección
    for (let i = categories.length - 1; i >= 0; i--) {
        const category = categories[i];
        if (isPointInCategory(canvasX, canvasY, category)) {
            return category;
        }
    }

    // Verificar arcos de restricciones arrastrables
    for (let i = constraints.length - 1; i >= 0; i--) {
        const constraint = constraints[i];
        if (constraint.constraintType === 'exclusivity' || constraint.constraintType === 'inclusivity') {
            if (isPointInArc(canvasX, canvasY, constraint)) {
                return constraint;
            }
        }
    }

    // Verificar agregaciones (rectángulos redondeados)
    for (let i = aggregations.length - 1; i >= 0; i--) {
        const agg = aggregations[i];
        if (canvasX >= agg.x && 
            canvasX <= agg.x + agg.width &&
            canvasY >= agg.y && 
            canvasY <= agg.y + agg.height) {
            return agg;
        }
    }
    
    // Verificar jerarquías (triángulos)
    for (let i = hierarchies.length - 1; i >= 0; i--) {
        const hierarchy = hierarchies[i];
        if (isPointInHierarchyTriangle(canvasX, canvasY, hierarchy)) {
            return hierarchy;
        }
    }
    
    // Verificar etiquetas de cardinalidad
    for (let i = cardinalityLabels.length - 1; i >= 0; i--) {
        const label = cardinalityLabels[i];
        if (canvasX >= label.x && 
            canvasX <= label.x + label.width &&
            canvasY >= label.y && 
            canvasY <= label.y + label.height) {
            return label;
        }
    }
    
    // Verificar relaciones (rombos)
    for (let i = relationships.length - 1; i >= 0; i--) {
        const rel = relationships[i];
        if (isPointInDiamond(canvasX, canvasY, rel.x, rel.y, rel.width, rel.height)) {
            return rel;
        }
    }
    
    // Verificar atributos (óvalos)
    for (let i = attributes.length - 1; i >= 0; i--) {
        const attr = attributes[i];
        const dx = canvasX - attr.x;
        const dy = canvasY - attr.y;
        if ((dx * dx) / (attr.radiusX * attr.radiusX) + 
            (dy * dy) / (attr.radiusY * attr.radiusY) <= 1) {
            return attr;
        }
    }
    
    // Verificar entidades (rectángulos)
    for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        if (canvasX >= entity.x && 
            canvasX <= entity.x + entity.width &&
            canvasY >= entity.y && 
            canvasY <= entity.y + entity.height) {
            return entity;
        }
    }
    
    return null;
}

// Calcular distancia de un punto a una línea
function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
        param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
}