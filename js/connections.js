// ===== GESTIÓN DE CONEXIONES =====

// Variables globales para conexiones
let connections = [];
let connectionIdCounter = 1;
let isConnectMode = false;
let connectLineType = null; // 'single' | 'double' | null
let connectSource = null;
let selectedConnection = null;

// Crear conexión
function createConnection(source, target, lineType = 'single') {
    const connection = {
        id: 'connection_' + connectionIdCounter++,
        type: 'connection',
        source: source,
        target: target,
        lineType: lineType   // 'single' o 'double'
    };
    
    connections.push(connection);
    return connection;
}

// Dibujar conexión
function drawConnection(connection) {
    const source = connection.source;
    const target = connection.target;
    
    const sourcePoint = getElementCenter(source);
    const targetPoint = getElementCenter(target);
    
    // Determinar si es doble: por propiedad explícita del objeto
    const isDouble = connection.lineType === 'double';
    
    // Estilo
    if (selectedConnection && selectedConnection.id === connection.id) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3 / scale;
    } else {
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2 / scale;
    }
    
    // Línea principal
    ctx.beginPath();
    ctx.moveTo(sourcePoint.x, sourcePoint.y);
    ctx.lineTo(targetPoint.x, targetPoint.y);
    ctx.stroke();
    
    // Segunda línea paralela si es doble
    if (isDouble) {
        const offset = 4 / scale;
        const dx = targetPoint.x - sourcePoint.x;
        const dy = targetPoint.y - sourcePoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
            const perpX = -dy / length * offset;
            const perpY = dx / length * offset;
            
            ctx.beginPath();
            ctx.moveTo(sourcePoint.x + perpX, sourcePoint.y + perpY);
            ctx.lineTo(targetPoint.x + perpX, targetPoint.y + perpY);
            ctx.stroke();
        }
    }
}

// Obtener conexión en una posición
function getConnectionAtPosition(x, y) {
    const canvasX = (x - offsetX) / scale;
    const canvasY = (y - offsetY) / scale;
    const threshold = 5 / scale;
    
    for (let i = connections.length - 1; i >= 0; i--) {
        const conn = connections[i];
        const source = getElementCenter(conn.source);
        const target = getElementCenter(conn.target);
        
        const distance = pointToLineDistance(
            canvasX, canvasY,
            source.x, source.y,
            target.x, target.y
        );
        
        if (distance < threshold) {
            return conn;
        }
    }
    
    return null;
}

// Eliminar conexión
function deleteConnection(connection) {
    const index = connections.findIndex(c => c.id === connection.id);
    if (index !== -1) {
        connections.splice(index, 1);
    }
}

// Eliminar conexiones asociadas a un elemento
function deleteConnectionsForElement(element) {
    connections = connections.filter(conn => 
        conn.source.id !== element.id && conn.target.id !== element.id
    );
}

// Limpiar todas las conexiones
function clearAllConnections() {
    if (connections.length === 0) {
        alert('No hay conexiones para eliminar');
        return;
    }
    
    if (confirm('¿Eliminar todas las conexiones?')) {
        connections = [];
        selectedConnection = null;
        draw();
    }
}

// Activar modo conexión con tipo de línea
function activateConnectMode(lineType) {
    // Si ya está activo con el mismo tipo, desactivar (toggle)
    if (isConnectMode && connectLineType === lineType) {
        deactivateConnectMode();
        return;
    }
    
    // Activar con el tipo indicado
    isConnectMode = true;
    connectLineType = lineType;
    connectSource = null;
    
    // Actualizar botones
    updateConnectButtons();
    
    canvas.classList.add('connect-mode');
    canvas.style.cursor = 'crosshair';
    draw();
}

// Desactivar modo conexión
function deactivateConnectMode() {
    isConnectMode = false;
    connectLineType = null;
    connectSource = null;
    updateConnectButtons();
    canvas.classList.remove('connect-mode');
    canvas.style.cursor = 'grab';
    draw();
}

// Actualizar estado visual de los botones de conexión
function updateConnectButtons() {
    const btnSingle = document.getElementById('toggleConnectSingle');
    const btnDouble = document.getElementById('toggleConnectDouble');
    
    if (btnSingle) {
        btnSingle.classList.toggle('active', isConnectMode && connectLineType === 'single');
    }
    if (btnDouble) {
        btnDouble.classList.toggle('active', isConnectMode && connectLineType === 'double');
    }
}

// Mantener compatibilidad con código antiguo que llame toggleConnectMode
function toggleConnectMode() {
    activateConnectMode('single');
}
