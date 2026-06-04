// ===== FUNCIONALIDADES DEL TOOLBAR =====

// ===== GRUPO 1: ARCHIVO =====

// Nuevo diagrama (limpiar canvas)
function newDiagram() {
    if (entities.length === 0 && 
        attributes.length === 0 && 
        relationships.length === 0 && 
        connections.length === 0 &&
        cardinalityLabels.length === 0 &&
        hierarchies.length === 0 &&
        categories.length === 0 &&
        aggregations.length === 0 &&
        constraints.length === 0) {
        alert('El diagrama ya está vacío');
        return;
    }
    
    if (confirm('¿Crear un nuevo diagrama? Se perderá el trabajo actual si no lo has guardado.')) {
        // Limpiar todos los arrays
        entities = [];
        attributes = [];
        relationships = [];
        connections = [];
        cardinalityLabels = [];
        hierarchies = [];
        categories = [];
        aggregations = [];
        constraints = [];
        
        // Resetear contadores
        entityIdCounter = 1;
        attributeIdCounter = 1;
        relationshipIdCounter = 1;
        connectionIdCounter = 1;
        cardinalityIdCounter = 1;
        hierarchyIdCounter = 1;
        categoryIdCounter = 1;
        aggregationIdCounter = 1;
        constraintIdCounter = 1;
        
        // Resetear selecciones y modos
        selectedEntity = null;
        selectedConnection = null;
        selectedConstraint = null;
        connectSource = null;
        constraintSource = null;
        isConnectMode = false;
        isConstraintMode = false;
        currentConstraintType = null;
        
        // Actualizar botones
        document.getElementById('toggleConnectMode').classList.remove('active');
        updateConstraintButtons();
        
        // Resetear vista
        offsetX = 0;
        offsetY = 0;
        scale = 1;
        
        draw();
    }
}

// Guardar diagrama (JSON)
function saveDiagram() {
    const diagramData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        entities: entities,
        attributes: attributes,
        relationships: relationships,
        connections: connections,
        cardinalityLabels: cardinalityLabels,
        hierarchies: hierarchies,
        categories: categories,
        aggregations: aggregations,
        constraints: constraints,
        counters: {
            entityIdCounter: entityIdCounter,
            attributeIdCounter: attributeIdCounter,
            relationshipIdCounter: relationshipIdCounter,
            connectionIdCounter: connectionIdCounter,
            cardinalityIdCounter: cardinalityIdCounter,
            hierarchyIdCounter: hierarchyIdCounter,
            categoryIdCounter: categoryIdCounter,
            aggregationIdCounter: aggregationIdCounter,
            constraintIdCounter: constraintIdCounter
        }
    };
    
    const jsonString = JSON.stringify(diagramData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagrama_ER_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Diagrama guardado exitosamente');
}

// Cargar diagrama (JSON)
function loadDiagram() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const diagramData = JSON.parse(event.target.result);
                
                // Validar estructura básica
                if (!diagramData.version) {
                    throw new Error('Archivo JSON inválido: falta versión');
                }
                
                // Confirmar carga
                if (entities.length > 0 || attributes.length > 0 || relationships.length > 0) {
                    if (!confirm('¿Cargar este diagrama? Se perderá el trabajo actual si no lo has guardado.')) {
                        return;
                    }
                }
                
                // Restaurar datos
                entities = diagramData.entities || [];
                attributes = diagramData.attributes || [];
                relationships = diagramData.relationships || [];
                connections = diagramData.connections || [];
                cardinalityLabels = diagramData.cardinalityLabels || [];
                hierarchies = diagramData.hierarchies || [];
                categories = diagramData.categories || [];
                aggregations = diagramData.aggregations || [];
                constraints = diagramData.constraints || [];
                
                // Restaurar contadores
                if (diagramData.counters) {
                    entityIdCounter = diagramData.counters.entityIdCounter || 1;
                    attributeIdCounter = diagramData.counters.attributeIdCounter || 1;
                    relationshipIdCounter = diagramData.counters.relationshipIdCounter || 1;
                    connectionIdCounter = diagramData.counters.connectionIdCounter || 1;
                    cardinalityIdCounter = diagramData.counters.cardinalityIdCounter || 1;
                    hierarchyIdCounter = diagramData.counters.hierarchyIdCounter || 1;
                    categoryIdCounter = diagramData.counters.categoryIdCounter || 1;
                    aggregationIdCounter = diagramData.counters.aggregationIdCounter || 1;
                    constraintIdCounter = diagramData.counters.constraintIdCounter || 1;
                }
                
                // Reconstruir referencias en conexiones
                connections = connections.map(conn => {
                    return {
                        ...conn,
                        source: findElementById(conn.source.id),
                        target: findElementById(conn.target.id)
                    };
                }).filter(conn => conn.source && conn.target);
                
                // Reconstruir referencias en restricciones de tipo conexión
                constraints = constraints.map(constraint => {
                    if (constraint.constraintType === 'exclusion' || 
                        constraint.constraintType === 'inclusion') {
                        return {
                            ...constraint,
                            source: findElementById(constraint.source.id),
                            target: findElementById(constraint.target.id)
                        };
                    }
                    return constraint;
                }).filter(constraint => {
                    if (constraint.constraintType === 'exclusion' || 
                        constraint.constraintType === 'inclusion') {
                        return constraint.source && constraint.target;
                    }
                    return true;
                });
                
                // Resetear selecciones
                selectedEntity = null;
                selectedConnection = null;
                selectedConstraint = null;
                
                draw();
                console.log('Diagrama cargado exitosamente');
                
            } catch (error) {
                alert('Error al cargar el diagrama: ' + error.message);
                console.error('Error:', error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Función auxiliar para encontrar elemento por ID
function findElementById(id) {
    let element = entities.find(e => e.id === id);
    if (element) return element;
    
    element = attributes.find(a => a.id === id);
    if (element) return element;
    
    element = relationships.find(r => r.id === id);
    if (element) return element;
    
    element = cardinalityLabels.find(c => c.id === id);
    if (element) return element;
    
    element = hierarchies.find(h => h.id === id);
    if (element) return element;
    
    element = categories.find(c => c.id === id);
    if (element) return element;
    
    element = aggregations.find(a => a.id === id);
    if (element) return element;
    
    element = constraints.find(c => c.id === id);
    if (element) return element;
    
    return null;
}

// Exportar como PNG
// Exportar como PNG
function exportToPNG() {
    // Calcular bounds del diagrama
    const bounds = calculateDiagramBounds();
    
    if (!bounds) {
        alert('No hay elementos para exportar');
        return;
    }
    
    // Añadir margen
    const margin = 50;
    const width = bounds.maxX - bounds.minX + margin * 2;
    const height = bounds.maxY - bounds.minY + margin * 2;
    
    // Crear canvas temporal
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fondo blanco
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, width, height);
    
    // Guardar estado
    tempCtx.save();
    
    // Transformación para centrar el diagrama
    tempCtx.translate(-bounds.minX + margin, -bounds.minY + margin);
    
    // DIBUJAR MANUALMENTE cada tipo de elemento
    const exportScale = 1;
    
    // 1. Conexiones
    connections.forEach(conn => {
        const source = getElementCenter(conn.source);
        const target = getElementCenter(conn.target);
        
 /*       const isDoubleLineConnection = 
            (conn.target.type === 'jerarquia' && 
             (conn.target.hierarchyType === 'total_exclusive' || conn.target.hierarchyType === 'total_overlapping')) ||
            (conn.source.type === 'jerarquia' && 
             (conn.source.hierarchyType === 'total_exclusive' || conn.source.hierarchyType === 'total_overlapping'));
        */
        const isDoubleLineConnection = conn.lineType === 'double';

        
        tempCtx.strokeStyle = '#7f8c8d';
        tempCtx.lineWidth = 2;
        
        tempCtx.beginPath();
        tempCtx.moveTo(source.x, source.y);
        tempCtx.lineTo(target.x, target.y);
        tempCtx.stroke();
        
        if (isDoubleLineConnection) {
            const offset = 4;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            if (length > 0) {
                const perpX = -dy / length * offset;
                const perpY = dx / length * offset;
                
                tempCtx.beginPath();
                tempCtx.moveTo(source.x + perpX, source.y + perpY);
                tempCtx.lineTo(target.x + perpX, target.y + perpY);
                tempCtx.stroke();
            }
        }
    });
    
    // 2. Restricciones de tipo conexión
    constraints.forEach(constraint => {
        if (constraint.constraintType === 'exclusion' || constraint.constraintType === 'inclusion') {
            const source = getElementCenter(constraint.source);
            const target = getElementCenter(constraint.target);
            
            tempCtx.strokeStyle = constraint.color;
            tempCtx.lineWidth = 2.5;
            
            if (constraint.constraintType === 'exclusion') {
                tempCtx.setLineDash([8, 4]);
                tempCtx.beginPath();
                tempCtx.moveTo(source.x, source.y);
                tempCtx.lineTo(target.x, target.y);
                tempCtx.stroke();
                tempCtx.setLineDash([]);
            } else {
                tempCtx.beginPath();
                tempCtx.moveTo(source.x, source.y);
                tempCtx.lineTo(target.x, target.y);
                tempCtx.stroke();
                
                // Flecha
                const angle = Math.atan2(target.y - source.y, target.x - source.x);
                const arrowSize = 12;
                
                tempCtx.save();
                tempCtx.fillStyle = constraint.color;
                tempCtx.translate(target.x, target.y);
                tempCtx.rotate(angle);
                
                tempCtx.beginPath();
                tempCtx.moveTo(0, 0);
                tempCtx.lineTo(-arrowSize, -arrowSize / 2);
                tempCtx.lineTo(-arrowSize, arrowSize / 2);
                tempCtx.closePath();
                tempCtx.fill();
                
                tempCtx.restore();
            }
        }
    });
    
    // 3. Agregaciones
    aggregations.forEach(agg => {
        const radius = agg.borderRadius;
        
        tempCtx.fillStyle = agg.color;
        tempCtx.strokeStyle = agg.strokeColor;
        tempCtx.lineWidth = 2;
        
        tempCtx.beginPath();
        tempCtx.moveTo(agg.x + radius, agg.y);
        tempCtx.lineTo(agg.x + agg.width - radius, agg.y);
        tempCtx.arcTo(agg.x + agg.width, agg.y, agg.x + agg.width, agg.y + radius, radius);
        tempCtx.lineTo(agg.x + agg.width, agg.y + agg.height - radius);
        tempCtx.arcTo(agg.x + agg.width, agg.y + agg.height, agg.x + agg.width - radius, agg.y + agg.height, radius);
        tempCtx.lineTo(agg.x + radius, agg.y + agg.height);
        tempCtx.arcTo(agg.x, agg.y + agg.height, agg.x, agg.y + agg.height - radius, radius);
        tempCtx.lineTo(agg.x, agg.y + radius);
        tempCtx.arcTo(agg.x, agg.y, agg.x + radius, agg.y, radius);
        tempCtx.closePath();
        tempCtx.fill();
        tempCtx.stroke();
        
        tempCtx.fillStyle = '#2c3e50';
        tempCtx.font = '14px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(agg.name, agg.x + agg.width / 2, agg.y + agg.height / 2);
    });
    
    // 4. Entidades
    entities.forEach(entity => {
        tempCtx.fillStyle = entity.color;
        tempCtx.strokeStyle = '#2980b9';
        tempCtx.lineWidth = 2;
        
        tempCtx.fillRect(entity.x, entity.y, entity.width, entity.height);
        tempCtx.strokeRect(entity.x, entity.y, entity.width, entity.height);
        
        if (entity.weak) {
            const offset = 4;
            tempCtx.strokeRect(
                entity.x + offset, 
                entity.y + offset, 
                entity.width - offset * 2, 
                entity.height - offset * 2
            );
        }
        
        tempCtx.fillStyle = '#fff';
        tempCtx.font = '14px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(entity.name, entity.x + entity.width / 2, entity.y + entity.height / 2);
    });
    
    // 5. Atributos
    attributes.forEach(attr => {
        tempCtx.fillStyle = attr.color;
        tempCtx.strokeStyle = '#27ae60';
        tempCtx.lineWidth = 2;
        
        tempCtx.beginPath();
        tempCtx.ellipse(attr.x, attr.y, attr.radiusX, attr.radiusY, 0, 0, 2 * Math.PI);
        tempCtx.fill();
        tempCtx.stroke();
        
        if (attr.attributeType === 'multivalued') {
            const offset = 4;
            tempCtx.beginPath();
            tempCtx.ellipse(attr.x, attr.y, attr.radiusX - offset, attr.radiusY - offset, 0, 0, 2 * Math.PI);
            tempCtx.stroke();
        }
        
        if (attr.attributeType === 'derived') {
            tempCtx.setLineDash([5, 5]);
            tempCtx.beginPath();
            tempCtx.ellipse(attr.x, attr.y, attr.radiusX, attr.radiusY, 0, 0, 2 * Math.PI);
            tempCtx.stroke();
            tempCtx.setLineDash([]);
        }
        
        tempCtx.fillStyle = '#fff';
        tempCtx.font = '14px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        
        const textMetrics = tempCtx.measureText(attr.name);
        const textWidth = textMetrics.width;
        
        tempCtx.fillText(attr.name, attr.x, attr.y);
        
        if (attr.attributeType === 'primary-key') {
            tempCtx.strokeStyle = '#fff';
            tempCtx.lineWidth = 1.5;
            tempCtx.beginPath();
            tempCtx.moveTo(attr.x - textWidth / 2, attr.y + 8);
            tempCtx.lineTo(attr.x + textWidth / 2, attr.y + 8);
            tempCtx.stroke();
        }
    });
    
    // 6. Relaciones
    relationships.forEach(rel => {
        const centerX = rel.x;
        const centerY = rel.y;
        const halfWidth = rel.width / 2;
        const halfHeight = rel.height / 2;
        
        tempCtx.fillStyle = rel.color;
        tempCtx.strokeStyle = '#e67e22';
        tempCtx.lineWidth = 2;
        
        tempCtx.beginPath();
        tempCtx.moveTo(centerX, centerY - halfHeight);
        tempCtx.lineTo(centerX + halfWidth, centerY);
        tempCtx.lineTo(centerX, centerY + halfHeight);
        tempCtx.lineTo(centerX - halfWidth, centerY);
        tempCtx.closePath();
        tempCtx.fill();
        tempCtx.stroke();
        
        if (rel.weak) {
            const offset = 6;
            const innerHalfWidth = halfWidth - offset;
            const innerHalfHeight = halfHeight - offset;
            
            tempCtx.beginPath();
            tempCtx.moveTo(centerX, centerY - innerHalfHeight);
            tempCtx.lineTo(centerX + innerHalfWidth, centerY);
            tempCtx.lineTo(centerX, centerY + innerHalfHeight);
            tempCtx.lineTo(centerX - innerHalfWidth, centerY);
            tempCtx.closePath();
            tempCtx.stroke();
        }
        
        tempCtx.fillStyle = '#fff';
        tempCtx.font = '14px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(rel.name, centerX, centerY);
    });
    
    // 7. Jerarquías
    hierarchies.forEach(h => {
        const config = getHierarchyConfig(h.hierarchyType);
        
        tempCtx.fillStyle = h.color;
        tempCtx.strokeStyle = '#8e44ad';
        tempCtx.lineWidth = 2;
        
        tempCtx.beginPath();
        tempCtx.moveTo(h.x, h.y + h.height/2);
        tempCtx.lineTo(h.x - h.width/2, h.y - h.height/2);
        tempCtx.lineTo(h.x + h.width/2, h.y - h.height/2);
        tempCtx.closePath();
        tempCtx.fill();
        tempCtx.stroke();
        
        const topY = h.y - h.height/2;
        const symbolY = topY - 12;
        
        if (config.isTotal) {
            tempCtx.fillStyle = '#ffffff';
            tempCtx.strokeStyle = '#8e44ad';
            tempCtx.lineWidth = 2;
            tempCtx.beginPath();
            tempCtx.arc(h.x, symbolY, 5, 0, 2 * Math.PI);
            tempCtx.fill();
            tempCtx.stroke();
        } else {
            tempCtx.lineWidth = 2;
            const lineHalfWidth = 8;
            tempCtx.beginPath();
            tempCtx.moveTo(h.x - lineHalfWidth, symbolY);
            tempCtx.lineTo(h.x + lineHalfWidth, symbolY);
            tempCtx.stroke();
        }
        
        tempCtx.strokeStyle = '#8e44ad';
        tempCtx.lineWidth = 2;
        tempCtx.beginPath();
        tempCtx.moveTo(h.x, symbolY + 4);
        tempCtx.lineTo(h.x, topY);
        tempCtx.stroke();
        
        if (config.hasArc) {
            const arcRadius = h.width / 1.5;
            const arcCenterY = h.y;
            
            tempCtx.beginPath();
            tempCtx.arc(h.x, arcCenterY, arcRadius, 0, Math.PI, false);
            tempCtx.stroke();
        }
        
        tempCtx.fillStyle = '#fff';
        tempCtx.font = 'bold 16px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(config.label, h.x, h.y);
    });
    
    // 8. Categorías
    categories.forEach(cat => {
        tempCtx.fillStyle = cat.color;
        tempCtx.strokeStyle = cat.strokeColor;
        tempCtx.lineWidth = 2;
        
        tempCtx.beginPath();
        tempCtx.arc(cat.x, cat.y, cat.radius, 0, 2 * Math.PI);
        tempCtx.fill();
        tempCtx.stroke();
        
        tempCtx.fillStyle = '#fff';
        tempCtx.font = 'bold 20px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(cat.label, cat.x, cat.y);
    });
    
    // 9. Cardinalidad
    cardinalityLabels.forEach(label => {
        tempCtx.fillStyle = label.color;
        tempCtx.strokeStyle = '#95a5a6';
        tempCtx.lineWidth = 1.5;
        
        tempCtx.fillRect(label.x, label.y, label.width, label.height);
        tempCtx.strokeRect(label.x, label.y, label.width, label.height);
        
        tempCtx.fillStyle = label.textColor;
        tempCtx.font = 'bold 13px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(label.text, label.x + label.width / 2, label.y + label.height / 2);
    });
    
    // Restaurar estado
    tempCtx.restore();
    
    // Convertir a imagen y descargar
    tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagrama_ER_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Diagrama exportado como PNG exitosamente');
    });
}

// Calcular límites del diagrama
function calculateDiagramBounds() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    const allElements = [
        ...entities.map(e => ({ x: e.x, y: e.y, width: e.width, height: e.height })),
        ...attributes.map(a => ({ x: a.x - a.radiusX, y: a.y - a.radiusY, width: a.radiusX * 2, height: a.radiusY * 2 })),
        ...relationships.map(r => ({ x: r.x - r.width / 2, y: r.y - r.height / 2, width: r.width, height: r.height })),
        ...cardinalityLabels.map(c => ({ x: c.x, y: c.y, width: c.width, height: c.height })),
        ...hierarchies.map(h => ({ x: h.x - h.width / 2, y: h.y - h.height / 2, width: h.width, height: h.height })),
        ...categories.map(c => ({ x: c.x - c.radius, y: c.y - c.radius, width: c.radius * 2, height: c.radius * 2 })),
        ...aggregations.map(a => ({ x: a.x, y: a.y, width: a.width, height: a.height })),
        ...constraints.filter(c => c.constraintType === 'exclusivity' || c.constraintType === 'inclusivity')
            .map(c => ({ x: c.x - c.width / 2, y: c.y - c.height / 2, width: c.width, height: c.height }))
    ];
    
    if (allElements.length === 0) {
        return null;
    }
    
    allElements.forEach(elem => {
        minX = Math.min(minX, elem.x);
        minY = Math.min(minY, elem.y);
        maxX = Math.max(maxX, elem.x + elem.width);
        maxY = Math.max(maxY, elem.y + elem.height);
    });
    
    return { minX, minY, maxX, maxY };
}