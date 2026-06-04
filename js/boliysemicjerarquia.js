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
    
    // Dibujar letra (d u o) en el centro del triángulo
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${16 / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.label, centerX, centerY);
    
    // Dibujar semicírculo (curva) DEBAJO rodeando el vértice inferior si es EXCLUSIVA
    if (config.hasArc) {
        const arcRadius = width / 3.5;
        const bottomY = centerY + height/2;
        const arcCenterY = bottomY; // Centro del arco en el vértice
        
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        // Arco desde 0° hasta 180° (semicírculo inferior)
        ctx.arc(
            centerX, 
            arcCenterY, 
            arcRadius, 
            0,  // Ángulo inicial (0° = derecha)
            Math.PI, // Ángulo final (180° = izquierda)
            false // Sentido antihorario
        );
        ctx.stroke();
    }
    
    // DIBUJAR SÍMBOLO ARRIBA (bolita blanca para Total, línea para Parcial)
    const topY = centerY - height/2;
    const symbolY = topY - 12 / scale; // Separación del triángulo
    
    if (config.isTotal) {
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
        // NO hay línea de conexión
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 2 / scale;
        const lineHalfWidth = 10 / scale;
        ctx.beginPath();
        ctx.moveTo(centerX - lineHalfWidth, symbolY);
        ctx.lineTo(centerX + lineHalfWidth, symbolY);
        ctx.stroke();
    }
}