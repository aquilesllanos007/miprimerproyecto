// ===== GESTIÓN DE RESTRICCIONES E-R =====

// Variables globales para restricciones
let constraints = [];
let constraintIdCounter = 1;
let isConstraintMode = false;
let constraintSource = null;
let currentConstraintType = null;
let selectedConstraint = null;

// Tipos de restricciones
const CONSTRAINT_TYPES = {
    EXCLUSIVITY: 'exclusivity',      // Arco arrastrable con XOR
    EXCLUSION: 'exclusion',          // Línea discontinua entre relaciones
    INCLUSIVITY: 'inclusivity',      // Arco arrastrable con flecha
    INCLUSION: 'inclusion'           // Flecha entre relaciones
};

// ===== ARCOS ARRASTRABLES (Exclusividad e Inclusividad) =====

// Crear arco de exclusividad
function createExclusivityArc(x, y) {
    return {
        id: 'constraint_' + constraintIdCounter++,
        type: 'restriccion',
        constraintType: CONSTRAINT_TYPES.EXCLUSIVITY,
        x: x,
        y: y,
        width: 130,
        height: 60,
        label: 'XOR',
        color: '#e74c3c'
    };
}

// Crear arco de inclusividad
function createInclusivityArc(x, y) {
    return {
        id: 'constraint_' + constraintIdCounter++,
        type: 'restriccion',
        constraintType: CONSTRAINT_TYPES.INCLUSIVITY,
        x: x,
        y: y,
        width: 130,
        height: 60,
        cardinality: '1,n',
        color: '#3498db'
    };
}

// Dibujar arco de exclusividad
function drawExclusivityArc(arc) {
    const centerX = arc.x;
    const centerY = arc.y;
    const width = arc.width;
    const height = arc.height;
    
    // Selección visual
    if (selectedEntity && selectedEntity.id === arc.id) {
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 4 / scale;
        drawArcShape(centerX, centerY, width + 6, height + 6);
        ctx.stroke();
    }
    
    // Dibujar arco
    ctx.strokeStyle = arc.color;
    ctx.lineWidth = 3 / scale;
    drawArcShape(centerX, centerY, width, height);
    ctx.stroke();
    
    // Etiqueta XOR
    ctx.fillStyle = arc.color;
    ctx.font = `bold ${14 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(arc.label, centerX, centerY - height / 2 + 30 / scale);
}

// Dibujar arco de inclusividad
function drawInclusivityArc(arc) {
    const centerX = arc.x;
    const centerY = arc.y;
    const width = arc.width;
    const height = arc.height;
    
    // Selección visual
    if (selectedEntity && selectedEntity.id === arc.id) {
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 4 / scale;
        drawArcShape(centerX, centerY, width + 6, height + 6);
        ctx.stroke();
    }
    
    // Dibujar arco
    ctx.strokeStyle = arc.color;
    ctx.lineWidth = 3 / scale;
    drawArcShape(centerX, centerY, width, height);
    ctx.stroke();
    
    // Dibujar flecha en el extremo derecho del arco
    const arrowX = centerX + width / 2;
    const arrowY = centerY;
    drawArrowhead(arrowX, arrowY, 0, arc.color); // Apuntando a la derecha
    
    // Etiqueta de cardinalidad
    ctx.fillStyle = arc.color;
    ctx.font = `bold ${12 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`(${arc.cardinality})`, centerX, centerY - height / 2 + 30 / scale);
}

// Función auxiliar para dibujar forma de arco
function drawArcShape(centerX, centerY, width, height) {
    const startX = centerX - width / 2;
    const endX = centerX + width / 2;
    const controlY = centerY + height / 2;
    
    ctx.beginPath();
    ctx.moveTo(startX, centerY);
    ctx.quadraticCurveTo(centerX, controlY, endX, centerY);
}

// Detectar si un punto está dentro del área del arco
function isPointInArc(px, py, arc) {
    const centerX = arc.x;
    const centerY = arc.y;
    const width = arc.width;
    const height = arc.height;
    
    // Área rectangular aproximada del arco
    const threshold = 15 / scale;
    
    // Verificar si está cerca de la curva
    const startX = centerX - width / 2;
    const endX = centerX + width / 2;
    const controlY = centerY + height / 2;
    
    // Aproximación: verificar distancia al cuadrático
    for (let t = 0; t <= 1; t += 0.1) {
        const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * centerX + t * t * endX;
        const y = (1 - t) * (1 - t) * centerY + 2 * (1 - t) * t * controlY + t * t * centerY;
        
        const dist = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
        if (dist < threshold) {
            return true;
        }
    }
    
    return false;
}

// ===== CONEXIONES ENTRE RELACIONES (Exclusión e Inclusión) =====

// Crear restricción de conexión
function createConstraintConnection(type, source, target) {
    // Validar que source y target sean relaciones
    if (source.type !== 'relacion' || target.type !== 'relacion') {
        alert('Las restricciones de exclusión e inclusión solo se pueden aplicar entre relaciones');
        return null;
    }
    
    return {
        id: 'constraint_' + constraintIdCounter++,
        type: 'restriccion',
        constraintType: type,
        source: source,
        target: target,
        color: type === CONSTRAINT_TYPES.EXCLUSION ? '#9b59b6' : '#16a085'
    };
}

// Dibujar restricción de conexión
function drawConstraintConnection(constraint) {
    const source = getElementCenter(constraint.source);
    const target = getElementCenter(constraint.target);
    
    ctx.strokeStyle = constraint.color;
    ctx.fillStyle = constraint.color;
    
    // Selección visual
    if (selectedConstraint && selectedConstraint.id === constraint.id) {
        ctx.lineWidth = 4 / scale;
    } else {
        ctx.lineWidth = 2.5 / scale;
    }
    
    if (constraint.constraintType === CONSTRAINT_TYPES.EXCLUSION) {
        // Línea discontinua
        ctx.setLineDash([8 / scale, 4 / scale]);
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setLineDash([]);
    } else if (constraint.constraintType === CONSTRAINT_TYPES.INCLUSION) {
        // Flecha directa
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        
        // Dibujar flecha en el extremo
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        drawArrowhead(target.x, target.y, angle, constraint.color);
    }
}

// Función auxiliar para dibujar punta de flecha
function drawArrowhead(x, y, angle, color) {
    const arrowSize = 12 / scale;
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowSize, -arrowSize / 2);
    ctx.lineTo(-arrowSize, arrowSize / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// ===== FUNCIONES PRINCIPALES =====

// Dibujar restricción (dispatcher)
function drawConstraint(constraint) {
    if (constraint.constraintType === CONSTRAINT_TYPES.EXCLUSIVITY) {
        drawExclusivityArc(constraint);
    } else if (constraint.constraintType === CONSTRAINT_TYPES.INCLUSIVITY) {
        drawInclusivityArc(constraint);
    } else {
        drawConstraintConnection(constraint);
    }
}

// Detectar restricción en posición (solo para conexiones)
function getConstraintAtPosition(x, y) {
    const canvasX = (x - offsetX) / scale;
    const canvasY = (y - offsetY) / scale;
    const threshold = 8 / scale;
    
    for (let i = constraints.length - 1; i >= 0; i--) {
        const constraint = constraints[i];
        
        // Si es arco arrastrable, se maneja en getElementAtPosition
        if (constraint.constraintType === CONSTRAINT_TYPES.EXCLUSIVITY ||
            constraint.constraintType === CONSTRAINT_TYPES.INCLUSIVITY) {
            continue;
        }
        
        // Para conexiones (exclusión e inclusión)
        const source = getElementCenter(constraint.source);
        const target = getElementCenter(constraint.target);
        
        const distance = pointToLineDistance(
            canvasX, canvasY,
            source.x, source.y,
            target.x, target.y
        );
        
        if (distance < threshold) {
            return constraint;
        }
    }
    
    return null;
}

// Eliminar restricción
function deleteConstraint(constraint) {
    const index = constraints.findIndex(c => c.id === constraint.id);
    if (index !== -1) {
        constraints.splice(index, 1);
    }
}

// Eliminar restricciones asociadas a una relación
function deleteConstraintsForRelation(relation) {
    constraints = constraints.filter(c => {
        // Solo eliminar restricciones de conexión (no arcos arrastrables)
        if (c.constraintType === CONSTRAINT_TYPES.EXCLUSIVITY ||
            c.constraintType === CONSTRAINT_TYPES.INCLUSIVITY) {
            return true; // Mantener arcos
        }
        return c.source.id !== relation.id && c.target.id !== relation.id;
    });
}

// Toggle modo restricción (solo para exclusión e inclusión)
function toggleConstraintMode(type) {
    // Solo para exclusión e inclusión (que son conexiones)
    if (type !== 'exclusion' && type !== 'inclusion') {
        return;
    }
    
    // Si ya está en modo restricción del mismo tipo, desactivar
    if (isConstraintMode && currentConstraintType === type) {
        isConstraintMode = false;
        currentConstraintType = null;
        constraintSource = null;
        updateConstraintButtons();
        canvas.style.cursor = 'grab';
        draw();
        return;
    }
    
    // Activar modo restricción
    isConstraintMode = true;
    currentConstraintType = type;
    constraintSource = null;
    
    // Desactivar modo conexión si estaba activo
    if (isConnectMode) {
        isConnectMode = false;
        document.getElementById('toggleConnectMode').classList.remove('active');
    }
    
    updateConstraintButtons();
    canvas.style.cursor = 'crosshair';
    draw();
}

// Actualizar estado visual de botones de restricción
function updateConstraintButtons() {
    const buttons = ['btnExclusion', 'btnInclusion'];
    
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.remove('active');
        }
    });
    
    if (isConstraintMode && currentConstraintType) {
        const activeButtonMap = {
            'exclusion': 'btnExclusion',
            'inclusion': 'btnInclusion'
        };
        
        const activeBtn = document.getElementById(activeButtonMap[currentConstraintType]);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
}

// Manejar clic en modo restricción
function handleConstraintClick(element) {
    // Solo permitir restricciones entre relaciones
    if (element.type !== 'relacion') {
        alert('Las restricciones solo se pueden aplicar entre relaciones');
        return;
    }
    
    if (!constraintSource) {
        // Primer clic: seleccionar origen
        constraintSource = element;
        draw();
    } else {
        // Segundo clic: crear restricción
        if (constraintSource.id !== element.id) {
            const newConstraint = createConstraintConnection(
                currentConstraintType,
                constraintSource,
                element
            );
            
            if (newConstraint) {
                constraints.push(newConstraint);
            }
        }
        
        constraintSource = null;
        draw();
    }
}