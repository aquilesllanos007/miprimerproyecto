// ===== CONFIGURACIÓN DEL CANVAS =====
const canvasArea = document.getElementById('canvasArea');
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// Variables de estado del canvas
let offsetX = 0;
let offsetY = 0;
let scale = 1;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

// Variables de edición y selección
let isEditingText = false;
let editingElement = null;
let selectedEntity = null;
let selectedEntities = []; // NUEVO: Array para selección múltiple
let isDraggingEntity = false;
let isDraggingMultiple = false; // NUEVO: Flag para arrastre múltiple
let dragOffsetX = 0;
let dragOffsetY = 0;
let multiDragOffsets = []; // NUEVO: Offsets individuales para cada elemento seleccionado

// ===== INICIALIZACIÓN =====
function initCanvas() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupEventListeners();
    draw();
}

// Ajustar tamaño del canvas al contenedor
function resizeCanvas() {
    canvas.width = canvasArea.clientWidth;
    canvas.height = canvasArea.clientHeight;
    draw();
}

// ===== EVENTOS DE INTERACCIÓN =====
function setupEventListeners() {
    // Pan y drag
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    // Zoom (rueda del mouse)
    canvas.addEventListener('wheel', doZoom);
    
    // Botones de la barra lateral
    document.querySelectorAll('.symbol-btn').forEach(btn => {
        btn.addEventListener('click', handleSymbolClick);
    });

    // Botones de acción
    document.getElementById('toggleConnectSingle').addEventListener('click', () => activateConnectMode('single'));
    document.getElementById('toggleConnectDouble').addEventListener('click', () => activateConnectMode('double'));
    document.getElementById('clearConnections').addEventListener('click', clearAllConnections);

    // Botones de restricciones (NUEVO)
    document.getElementById('btnExclusion').addEventListener('click', () => toggleConstraintMode('exclusion'));
    document.getElementById('btnInclusion').addEventListener('click', () => toggleConstraintMode('inclusion'));

    // Botones del toolbar - Grupo 1: Archivo
    document.getElementById('btnNew').addEventListener('click', newDiagram);
    document.getElementById('btnSave').addEventListener('click', saveDiagram);
    document.getElementById('btnLoad').addEventListener('click', loadDiagram);
    document.getElementById('btnExportPNG').addEventListener('click', exportToPNG);

    // Teclado
    document.addEventListener('keydown', handleKeyDown);
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (isConstraintMode) {
        // Modo restricción: seleccionar relaciones para conectar
        const element = getElementAtPosition(mouseX, mouseY);
        
        if (element) {
            handleConstraintClick(element);
        } else {
            // Clic en vacío: cancelar selección
            constraintSource = null;
            draw();
        }
    } else if (isConnectMode) {
        // Modo conexión: seleccionar elementos para conectar
        const element = getElementAtPosition(mouseX, mouseY);
        
        if (element) {
            if (!connectSource) {
                // Primer clic: seleccionar origen
                connectSource = element;
                draw();
            } else {
                // Segundo clic: crear conexión
                if (connectSource.id !== element.id) {
                    createConnection(connectSource, element, connectLineType || 'single');
                }
                connectSource = null;
                draw();
            }
        } else {
            // Clic en vacío: cancelar selección
            connectSource = null;
            draw();
        }
    } else {
        // Modo normal
        const isCtrlPressed = e.ctrlKey || e.metaKey; // Ctrl en Windows/Linux, Cmd en Mac
        
        // Primero verificar si se hizo clic en una restricción
        const constraint = getConstraintAtPosition(mouseX, mouseY);
        if (constraint) {
            if (!isCtrlPressed) {
                selectedEntity = null;
                selectedEntities = [];
                selectedConnection = null;
            }
            selectedConstraint = constraint;
            draw();
            return;
        }
        
        // Luego verificar si se hizo clic en una conexión
        const connection = getConnectionAtPosition(mouseX, mouseY);
        if (connection) {
            if (isCtrlPressed) {
                // Añadir/quitar conexión de la selección múltiple
                const index = selectedEntities.findIndex(e => e.id === connection.id);
                if (index !== -1) {
                    selectedEntities.splice(index, 1);
                    selectedConnection = null;
                } else {
                    selectedEntities.push(connection);
                    selectedConnection = connection;
                }
                selectedEntity = null;
                selectedConstraint = null;
            } else {
                selectedEntity = null;
                selectedEntities = [connection];
                selectedConnection = connection;
                selectedConstraint = null;
            }
            draw();
            return;
        }
        
        // Si no hay conexión ni restricción, verificar elementos
        const element = getElementAtPosition(mouseX, mouseY);
        
        if (element) {
            if (isCtrlPressed) {
                // Selección múltiple con Ctrl
                const index = selectedEntities.findIndex(e => e.id === element.id);
                if (index !== -1) {
                    // Si ya está seleccionado, quitarlo
                    selectedEntities.splice(index, 1);
                    selectedEntity = selectedEntities.length > 0 ? selectedEntities[0] : null;
                } else {
                    // Añadir a la selección
                    selectedEntities.push(element);
                    selectedEntity = element;
                }
                selectedConnection = null;
                selectedConstraint = null;
            } else {
                // Verificar si el elemento clickeado está en la selección múltiple
                const isInSelection = selectedEntities.some(e => e.id === element.id);
                
                if (isInSelection && selectedEntities.length > 1) {
                    // Si está en selección múltiple, iniciar arrastre múltiple
                    isDraggingMultiple = true;
                    const canvasX = (mouseX - offsetX) / scale;
                    const canvasY = (mouseY - offsetY) / scale;
                    
                    // Calcular offsets individuales para cada elemento
                    multiDragOffsets = selectedEntities.map(elem => ({
                        id: elem.id,
                        offsetX: canvasX - elem.x,
                        offsetY: canvasY - elem.y
                    }));
                } else {
                    // Selección simple
                    selectedEntity = element;
                    selectedEntities = [element];
                    selectedConnection = null;
                    selectedConstraint = null;
                    
                    // Iniciar arrastre simple
                    isDraggingEntity = true;
                    const canvasX = (mouseX - offsetX) / scale;
                    const canvasY = (mouseY - offsetY) / scale;
                    dragOffsetX = canvasX - element.x;
                    dragOffsetY = canvasY - element.y;
                }
            }
            
            canvas.style.cursor = 'move';
        } else {
            // Deseleccionar si hace clic fuera
            if (!isCtrlPressed) {
                selectedEntity = null;
                selectedEntities = [];
                selectedConnection = null;
                selectedConstraint = null;
            }
            // Iniciar pan del canvas
            startPan(e);
        }
        
        draw();
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (isConnectMode || isConstraintMode) {
        // En modo conexión o restricción, no hacer nada especial en mousemove
        return;
    }
    
    if (isDraggingMultiple) {
        // Arrastrar múltiples elementos
        const canvasX = (mouseX - offsetX) / scale;
        const canvasY = (mouseY - offsetY) / scale;
        
        selectedEntities.forEach(elem => {
            const offset = multiDragOffsets.find(o => o.id === elem.id);
            if (offset) {
                elem.x = canvasX - offset.offsetX;
                elem.y = canvasY - offset.offsetY;
            }
        });
        draw();
    } else if (isDraggingEntity && selectedEntity) {
        // Arrastrar elemento único
        const canvasX = (mouseX - offsetX) / scale;
        const canvasY = (mouseY - offsetY) / scale;
        selectedEntity.x = canvasX - dragOffsetX;
        selectedEntity.y = canvasY - dragOffsetY;
        draw();
    } else if (isPanning) {
        // Pan del canvas
        doPan(e);
    } else {
        // Cambiar cursor si está sobre un elemento
        const element = getElementAtPosition(mouseX, mouseY);
        const connection = getConnectionAtPosition(mouseX, mouseY);
        const constraint = getConstraintAtPosition(mouseX, mouseY);
        
        if (element || connection || constraint) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'grab';
        }
    }
}

function handleMouseUp() {
    isDraggingEntity = false;
    isDraggingMultiple = false; // NUEVO
    multiDragOffsets = []; // NUEVO
    endPan();
    
    // Cambiar cursor según el modo
    if (isConstraintMode) {
        canvas.style.cursor = 'crosshair';
    } else if (isConnectMode) {
        canvas.style.cursor = 'crosshair';
    } else if (selectedEntity || selectedEntities.length > 0) {
        canvas.style.cursor = 'move';
    } else {
        canvas.style.cursor = 'grab';
    }
}

function startPan(e) {
    isPanning = true;
    startPanX = e.clientX - offsetX;
    startPanY = e.clientY - offsetY;
}

function doPan(e) {
    if (!isPanning) return;
    offsetX = e.clientX - startPanX;
    offsetY = e.clientY - startPanY;
    draw();
}

function endPan() {
    isPanning = false;
}

function doZoom(e) {
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const zoomIntensity = 0.1;
    const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    const newScale = scale + delta;
    
    if (newScale < 0.1 || newScale > 3) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    offsetX = mouseX - (mouseX - offsetX) * (newScale / scale);
    offsetY = mouseY - (mouseY - offsetY) * (newScale / scale);
    
    scale = newScale;
    draw();
}

// ===== MANEJO DE BOTONES =====
function handleSymbolClick(e) {
    const type = e.currentTarget.dataset.type;
    const weak = e.currentTarget.dataset.weak === 'true';
    const attributeType = e.currentTarget.dataset.attributeType || 'normal';
    const hierarchyType = e.currentTarget.dataset.hierarchyType;
    
    const centerX = (canvas.width / 2 - offsetX) / scale;
    const centerY = (canvas.height / 2 - offsetY) / scale;
    
    if (type === 'entidad') {
        const newEntity = createEntity(centerX - 60, centerY - 30, weak);
        entities.push(newEntity);
        draw();
    } else if (type === 'atributo') {
        const newAttribute = createAttribute(centerX, centerY, attributeType);
        attributes.push(newAttribute);
        draw();
    } else if (type === 'relacion') {
        const newRelationship = createRelationship(centerX, centerY, weak);
        relationships.push(newRelationship);
        draw();
    } else if (type === 'cardinalidad') {
        const newLabel = createCardinalityLabel(centerX - 25, centerY - 15);
        cardinalityLabels.push(newLabel);
        draw();
    } else if (type === 'jerarquia') {
        const newHierarchy = createHierarchy(centerX, centerY, hierarchyType);
        hierarchies.push(newHierarchy);
        draw();
    } else if (type === 'categoria') {
        const newCategory = createCategory(centerX, centerY);
        categories.push(newCategory);
        draw();
    } else if (type === 'agregacion') {
        const newAggregation = createAggregation(centerX - 70, centerY - 40);
        aggregations.push(newAggregation);
        draw();
    } else if (type === 'restriccion-exclusividad') {
        const newArc = createExclusivityArc(centerX, centerY);
        constraints.push(newArc);
        draw();
    } else if (type === 'restriccion-inclusividad') {
        const newArc = createInclusivityArc(centerX, centerY);
        constraints.push(newArc);
        draw();
    }
}

// ===== FUNCIONES DE DIBUJO =====
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    drawGrid();
    
    // Dibujar primero las conexiones (debajo de todo)
    connections.forEach(connection => {
        drawConnection(connection);
    });

    // Dibujar restricciones (NUEVO)
    constraints.forEach(constraint => {
        drawConstraint(constraint);
    });
    
    // Dibujar todas las entidades
    entities.forEach(entity => {
        drawEntity(entity);
    });
    
    // Dibujar todos los atributos
    attributes.forEach(attribute => {
        drawAttribute(attribute);
    });
    
    // Dibujar todas las relaciones
    relationships.forEach(relationship => {
        drawRelationship(relationship);
    });
    
    // Dibujar jerarquías ISA
    hierarchies.forEach(hierarchy => {
        drawHierarchy(hierarchy);
    });
    
    // Dibujar categorías (círculos con U)
    categories.forEach(category => {
        drawCategory(category);
    });
    
    // Dibujar agregaciones (rectángulos redondeados)
    aggregations.forEach(aggregation => {
        drawAggregation(aggregation);
    });

    // Dibujar etiquetas de cardinalidad
    cardinalityLabels.forEach(label => {
        drawCardinalityLabel(label);
    });
    
  // Si hay un elemento de origen seleccionado en modo conexión, marcarlo
    if (connectSource) {
        const center = getElementCenter(connectSource);
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 4 / scale;
        ctx.beginPath();
        ctx.arc(center.x, center.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Dibujar borde para elementos en selección múltiple (NUEVO)
    if (selectedEntities.length > 1) {
        selectedEntities.forEach(elem => {
            ctx.strokeStyle = '#3498db'; // Azul para selección múltiple
            ctx.lineWidth = 2 / scale;
            ctx.setLineDash([5 / scale, 5 / scale]);
            
            if (elem.type === 'entidad') {
                ctx.strokeRect(elem.x - 2, elem.y - 2, elem.width + 4, elem.height + 4);
            } else if (elem.type === 'atributo') {
                ctx.beginPath();
                ctx.ellipse(elem.x, elem.y, elem.radiusX + 2, elem.radiusY + 2, 0, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (elem.type === 'relacion') {
                const halfWidth = elem.width / 2;
                const halfHeight = elem.height / 2;
                ctx.beginPath();
                ctx.moveTo(elem.x, elem.y - halfHeight - 2);
                ctx.lineTo(elem.x + halfWidth + 2, elem.y);
                ctx.lineTo(elem.x, elem.y + halfHeight + 2);
                ctx.lineTo(elem.x - halfWidth - 2, elem.y);
                ctx.closePath();
                ctx.stroke();
            } else if (elem.type === 'cardinalidad') {
                ctx.strokeRect(elem.x - 2, elem.y - 2, elem.width + 4, elem.height + 4);
            } else if (elem.type === 'jerarquia') {
                ctx.beginPath();
                ctx.moveTo(elem.x, elem.y + elem.height/2 + 2);
                ctx.lineTo(elem.x - elem.width/2 - 2, elem.y - elem.height/2 - 2);
                ctx.lineTo(elem.x + elem.width/2 + 2, elem.y - elem.height/2 - 2);
                ctx.closePath();
                ctx.stroke();
            } else if (elem.type === 'categoria') {
                ctx.beginPath();
                ctx.arc(elem.x, elem.y, elem.radius + 2, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (elem.type === 'agregacion') {
                const radius = elem.borderRadius;
                ctx.beginPath();
                ctx.moveTo(elem.x + radius - 2, elem.y - 2);
                ctx.lineTo(elem.x + elem.width - radius + 2, elem.y - 2);
                ctx.arcTo(elem.x + elem.width + 2, elem.y - 2, elem.x + elem.width + 2, elem.y + radius, radius);
                ctx.lineTo(elem.x + elem.width + 2, elem.y + elem.height - radius + 2);
                ctx.arcTo(elem.x + elem.width + 2, elem.y + elem.height + 2, elem.x + elem.width - radius, elem.y + elem.height + 2, radius);
                ctx.lineTo(elem.x + radius, elem.y + elem.height + 2);
                ctx.arcTo(elem.x - 2, elem.y + elem.height + 2, elem.x - 2, elem.y + elem.height - radius, radius);
                ctx.lineTo(elem.x - 2, elem.y + radius - 2);
                ctx.arcTo(elem.x - 2, elem.y - 2, elem.x + radius, elem.y - 2, radius);
                ctx.closePath();
                ctx.stroke();
            } else if (elem.type === 'connection') {
                // Highlight para conexiones seleccionadas múltiples
                const source = getElementCenter(elem.source);
                const target = getElementCenter(elem.target);
                ctx.beginPath();
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            }
            
            ctx.setLineDash([]);
        });
    }

    // Si hay un elemento de origen seleccionado en modo restricción, marcarlo (NUEVO)
    if (constraintSource) {
        const center = getElementCenter(constraintSource);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 4 / scale;
        ctx.beginPath();
        ctx.arc(center.x, center.y, 12, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    ctx.restore();
    
    drawDebugInfo();
}

function drawGrid() {
    const gridSize = 20;
    const startX = Math.floor(-offsetX / scale / gridSize) * gridSize;
    const startY = Math.floor(-offsetY / scale / gridSize) * gridSize;
    const endX = startX + (canvas.width / scale) + gridSize;
    const endY = startY + (canvas.height / scale) + gridSize;
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1 / scale;
    
    for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }
    
    for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
}

function drawDebugInfo() {
    ctx.fillStyle = '#333';
    ctx.font = '12px monospace';
    ctx.fillText(`Zoom: ${(scale * 100).toFixed(0)}%`, 10, 20);
    ctx.fillText(`Pan: (${offsetX.toFixed(0)}, ${offsetY.toFixed(0)})`, 10, 35);
    ctx.fillText(`E: ${entities.length} | A: ${attributes.length} | R: ${relationships.length}`, 10, 50);
    ctx.fillText(`C: ${connections.length} | Card: ${cardinalityLabels.length} | ISA: ${hierarchies.length}`, 10, 65);
    ctx.fillText(`Cat: ${categories.length} | Agg: ${aggregations.length} | Res: ${constraints.length}`, 10, 80);
    
    if (isConnectMode) {
        ctx.fillStyle = '#27ae60';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('MODO CONEXIÓN ACTIVO', 10, 85);
    }

    if (isConstraintMode) {
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 14px Arial';
        const modeNames = {
            'exclusion': 'EXCLUSIÓN',
            'inclusion': 'INCLUSIÓN'
        };
        ctx.fillText(`MODO ${modeNames[currentConstraintType]} ACTIVO`, 10, isConnectMode ? 100 : 95);
    }
}

// ===== EDICIÓN Y ELIMINACIÓN DE ELEMENTOS =====
function startEditingText(element) {
    if (isEditingText) return;
    
    isEditingText = true;
    editingElement = element;
    
    const input = document.createElement('input');
    input.type = 'text';
    
    // Usar 'text' para cardinalidad, 'name' para otros elementos
    input.value = element.type === 'cardinalidad' ? element.text : element.name;
    input.id = 'tempInput';
    
    let screenX, screenY, screenWidth;
    
    if (element.type === 'entidad') {
        screenX = element.x * scale + offsetX;
        screenY = element.y * scale + offsetY + (element.height * scale) / 2;
        screenWidth = element.width * scale;
    } else if (element.type === 'atributo') {
        screenX = (element.x - element.radiusX) * scale + offsetX;
        screenY = element.y * scale + offsetY;
        screenWidth = element.radiusX * 2 * scale;
    } else if (element.type === 'relacion') {
        screenX = (element.x - element.width / 2) * scale + offsetX;
        screenY = element.y * scale + offsetY;
        screenWidth = element.width * scale;
    } else if (element.type === 'cardinalidad') {
        screenX = element.x * scale + offsetX;
        screenY = element.y * scale + offsetY + (element.height * scale) / 2;
        screenWidth = element.width * scale;
    } else if (element.type === 'agregacion') {
        screenX = element.x * scale + offsetX;
        screenY = element.y * scale + offsetY + (element.height * scale) / 2;
        screenWidth = element.width * scale;
    } else if (element.type === 'restriccion' && element.constraintType === 'inclusivity') {
        // Editar cardinalidad de arco de inclusividad
        screenX = element.x * scale + offsetX - 30;
        screenY = (element.y - element.height / 2 - 10 / scale) * scale + offsetY;
        screenWidth = 60;
    }
    
    input.style.position = 'absolute';
    input.style.left = screenX + 'px';
    input.style.top = screenY - 10 + 'px';
    input.style.width = screenWidth + 'px';
    input.style.textAlign = 'center';
    input.style.fontSize = '14px';
    input.style.border = '2px solid #3498db';
    
    input.style.outline = 'none';
    input.style.padding = '2px';
    input.style.zIndex = '1000';
    
    canvasArea.appendChild(input);
    input.focus();
    input.select();
    
    input.addEventListener('blur', finishEditingText);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            finishEditingText();
        } else if (e.key === 'Escape') {
            cancelEditingText();
        }
    });
}

function finishEditingText() {
    const input = document.getElementById('tempInput');
    if (!input) return;
    
    if (editingElement) {
        // Para cardinalidad usar 'text', para otros elementos usar 'name'
        if (editingElement.type === 'cardinalidad') {
            editingElement.text = input.value.trim();
        } else if (editingElement.type === 'restriccion' && editingElement.constraintType === 'inclusivity') {
            editingElement.cardinality = input.value.trim();
        } else {
            editingElement.name = input.value.trim();
        }
    }
    
    input.remove();
    isEditingText = false;
    editingElement = null;
    draw();
}

function cancelEditingText() {
    const input = document.getElementById('tempInput');
    if (input) input.remove();
    
    isEditingText = false;
    editingElement = null;
}

function deleteSelectedElement() {

    // Eliminar selección múltiple (NUEVO)
    if (selectedEntities.length > 1) {
        if (confirm(`¿Eliminar ${selectedEntities.length} elementos seleccionados?`)) {
            selectedEntities.forEach(elem => {
                // Eliminar conexiones asociadas
                deleteConnectionsForElement(elem);
                
                // Eliminar del array correspondiente
                if (elem.type === 'entidad') {
                    const index = entities.findIndex(e => e.id === elem.id);
                    if (index !== -1) entities.splice(index, 1);
                } else if (elem.type === 'atributo') {
                    const index = attributes.findIndex(a => a.id === elem.id);
                    if (index !== -1) attributes.splice(index, 1);
                } else if (elem.type === 'relacion') {
                    const index = relationships.findIndex(r => r.id === elem.id);
                    if (index !== -1) relationships.splice(index, 1);
                } else if (elem.type === 'cardinalidad') {
                    const index = cardinalityLabels.findIndex(c => c.id === elem.id);
                    if (index !== -1) cardinalityLabels.splice(index, 1);
                } else if (elem.type === 'jerarquia') {
                    const index = hierarchies.findIndex(h => h.id === elem.id);
                    if (index !== -1) hierarchies.splice(index, 1);
                } else if (elem.type === 'categoria') {
                    const index = categories.findIndex(c => c.id === elem.id);
                    if (index !== -1) categories.splice(index, 1);
                } else if (elem.type === 'agregacion') {
                    const index = aggregations.findIndex(a => a.id === elem.id);
                    if (index !== -1) aggregations.splice(index, 1);
                } else if (elem.type === 'restriccion') {
                    const index = constraints.findIndex(c => c.id === elem.id);
                    if (index !== -1) constraints.splice(index, 1);
                } else if (elem.type === 'connection') {
                    deleteConnection(elem);
                }
            });
            
            selectedEntities = [];
            selectedEntity = null;
            selectedConnection = null;
            draw();
        }
        return;
    }

    // Eliminar restricción seleccionada (NUEVO)
    if (selectedConstraint) {
        deleteConstraint(selectedConstraint);
        selectedConstraint = null;
        draw();
        return;
    }

    // Eliminar conexión seleccionada
    if (selectedConnection) {
        deleteConnection(selectedConnection);
        selectedConnection = null;
        draw();
        return;
    }
    
    // Eliminar elemento seleccionado
    if (!selectedEntity) return;
    
    // Eliminar conexiones asociadas al elemento
    deleteConnectionsForElement(selectedEntity);
    
    // Buscar y eliminar de entidades
    let index = entities.findIndex(e => e.id === selectedEntity.id);
    if (index !== -1) {
        entities.splice(index, 1);
        selectedEntity = null;
        draw();
        return;
    }
    
    // Buscar y eliminar de atributos
    index = attributes.findIndex(a => a.id === selectedEntity.id);
    if (index !== -1) {
        attributes.splice(index, 1);
        selectedEntity = null;
        draw();
        return;
    }
    
    // Buscar y eliminar de relaciones
    index = relationships.findIndex(r => r.id === selectedEntity.id);
    if (index !== -1) {
        relationships.splice(index, 1);
        selectedEntity = null;
        draw();
        return;
    }
    
    // Buscar y eliminar de cardinalidad
    index = cardinalityLabels.findIndex(c => c.id === selectedEntity.id);
    if (index !== -1) {
        cardinalityLabels.splice(index, 1);
        selectedEntity = null;
        draw();
        return;
    }
    
    // Buscar y eliminar de jerarquías
    index = hierarchies.findIndex(h => h.id === selectedEntity.id);
    if (index !== -1) {
        hierarchies.splice(index, 1);
        selectedEntity = null;
        draw();
        return;
    }
    
    // Buscar y eliminar de categorías
    index = categories.findIndex(cat => cat.id === selectedEntity.id);
    if (index !== -1) {
        categories.splice(index, 1);
        selectedEntity = null;
        draw();
        return;
    }

    index = aggregations.findIndex(agg => agg.id === selectedEntity.id);
    if (index !== -1) {
        aggregations.splice(index, 1);
        selectedEntity = null;
        draw();
        return;
    }

    // Buscar y eliminar de restricciones arrastrables
    index = constraints.findIndex(c => c.id === selectedEntity.id);
    if (index !== -1) {
        constraints.splice(index, 1);
        selectedEntity = null;
        draw();
    }

}

function handleKeyDown(e) {
    if (e.key === 'Delete' || e.key === 'Supr') {
        deleteSelectedElement();
    }
}

function handleDoubleClick(e) {
    if (isConnectMode || isConstraintMode) return; // No editar en modo conexión o restricción
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const element = getElementAtPosition(mouseX, mouseY);
    
    if (element) {
        startEditingText(element);
    }
}

// ===== INICIAR APLICACIÓN =====
initCanvas();