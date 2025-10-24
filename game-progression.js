// ===== GAME STATE MANAGEMENT =====
let gameState = {
    currentMother: 1,
    selectedMothers: [],
    isSelecting: false,
    maxMothers: 4
};

// ===== MOTHER DISPLAY CONTAINER =====
function createMotherDisplayContainer() {
    const container = document.createElement('div');
    container.id = 'mothers-display-container';
    container.className = 'mothers-display-container';
    container.innerHTML = `
        <h3>Selected Mothers</h3>
        <div id="mothers-row" class="mothers-row">
            <!-- Mother figures will appear here from right to left -->
        </div>
    `;
    
    // Insert after the card stack container
    const cardStackContainer = document.querySelector('.card-stack-container');
    if (cardStackContainer) {
        cardStackContainer.parentNode.insertBefore(container, cardStackContainer.nextSibling);
    }
}

// ===== UPDATE MOTHER DISPLAY =====
function updateMotherDisplay() {
    const mothersRow = document.getElementById('mothers-row');
    if (!mothersRow) return;
    
    mothersRow.innerHTML = '';
    
    console.log('🔄 Updating mother display with:', gameState.selectedMothers);
    
    // Display in selection order - RTL flow
    gameState.selectedMothers.forEach((mother, index) => {
        const motherElement = document.createElement('div');
        motherElement.className = 'mother-figure-display';
        
        // Create 4 rows of dots from the actual selected figure's points
        const verticalDots = mother.points.map(point => {
            // point: 0 = even (••), 1 = odd (•)
            return `<div class="figure-line">${point === 1 ? '•' : '••'}</div>`;
        }).join('');
        
        motherElement.innerHTML = `
            <div class="figure-lines">${verticalDots}</div>
        `;
        
        mothersRow.appendChild(motherElement);
    });
}

// ===== UPDATE PROGRESS =====
function updateProgress() {
    const progressText = document.querySelector('.progress-text');
    const progressFill = document.querySelector('.progress-fill');
    
    if (progressText && progressFill) {
        if (gameState.currentMother <= gameState.maxMothers) {
            progressText.textContent = `Select Mother ${gameState.currentMother}`;
            progressFill.style.width = `${(gameState.currentMother - 1) * 25}%`;
        }
        
        // Check if all mothers are selected
        if (gameState.currentMother > gameState.maxMothers) {
            progressText.textContent = 'Reading Complete!';
            progressFill.style.width = '100%';
        }
    }
}

// ===== GEOMANCY FIGURE CALCULATION =====
function calculateFigure(point1, point2, point3, point4) {
    // Convert points to proper format (0 = even/••, 1 = odd/•)
    const points = [point1, point2, point3, point4];
    
    // Find matching geomancy figure
    const figure = window.geomancyFigures.find(fig => 
        fig.points[0] === points[0] &&
        fig.points[1] === points[1] && 
        fig.points[2] === points[2] &&
        fig.points[3] === points[3]
    );
    
    return figure || window.geomancyFigures[0];
}

// ===== GEOMANCY MULTIPLICATION =====
function multiplyFigures(figureA, figureB) {
    // Multiply two figures according to geomancy rules:
    // even × even = even (0 × 0 = 0)
    // even × odd = odd   (0 × 1 = 1)  
    // odd × even = odd   (1 × 0 = 1)
    // odd × odd = even   (1 × 1 = 0)
    
    const resultPoints = [
        multiplyPoints(figureA.points[0], figureB.points[0]),
        multiplyPoints(figureA.points[1], figureB.points[1]),
        multiplyPoints(figureA.points[2], figureB.points[2]),
        multiplyPoints(figureA.points[3], figureB.points[3])
    ];
    
    return calculateFigure(...resultPoints);
}

function multiplyPoints(pointA, pointB) {
    // Geomancy multiplication rules:
    // 0 = even (••), 1 = odd (•)
    if (pointA === 1 && pointB === 1) {
        return 0; // odd × odd = even
    } else if (pointA === 0 && pointB === 0) {
        return 0; // even × even = even
    } else {
        return 1; // even × odd = odd, odd × even = odd
    }
}

// ===== COMPLETE CHART GENERATION =====
function generateCompleteChart() {
    console.log('🔄 generateCompleteChart called');
    
    if (gameState.selectedMothers.length !== 4) {
        console.error('❌ Need 4 mothers to generate chart');
        return null;
    }

    const M = gameState.selectedMothers;
    
    try {
        // First, create all the basic figures that don't depend on others
        const chart = {
            // Row 1: Mothers and Daughters
            house1: M[0],
            house2: M[1],
            house3: M[2],
            house4: M[3],
            
            // Daughters (vertical from mothers)
            house5: calculateFigure(
                M[0].points[0], M[1].points[0], M[2].points[0], M[3].points[0]
            ),
            house6: calculateFigure(
                M[0].points[1], M[1].points[1], M[2].points[1], M[3].points[1]
            ),
            house7: calculateFigure(
                M[0].points[2], M[1].points[2], M[2].points[2], M[3].points[2]
            ),
            house8: calculateFigure(
                M[0].points[3], M[1].points[3], M[2].points[3], M[3].points[3]
            ),
        };

        // Row 2: Nephews (multiplication of consecutive figures)
        chart.house9 = multiplyFigures(chart.house1, chart.house2);  // 1 × 2
        chart.house10 = multiplyFigures(chart.house3, chart.house4); // 3 × 4
        chart.house11 = multiplyFigures(chart.house5, chart.house6); // 5 × 6
        chart.house12 = multiplyFigures(chart.house7, chart.house8); // 7 × 8

        // Row 3: Witnesses (multiplication of consecutive nephews)
        chart.house13 = multiplyFigures(chart.house9, chart.house10);  // 9 × 10
        chart.house14 = multiplyFigures(chart.house11, chart.house12); // 11 × 12

        // Row 4: Judge (multiplication of witnesses)
        chart.house15 = multiplyFigures(chart.house13, chart.house14); // 13 × 14

        // Row 5: Final Figure (Judge × First Mother)
        chart.house16 = multiplyFigures(chart.house15, chart.house1);  // 15 × 1

        console.log('✅ Chart generated successfully with correct multiplication');
        console.log('Mothers:', M.map(m => m.name));
        console.log('Judge:', chart.house15.name);
        console.log('Final:', chart.house16.name);
        return chart;
        
    } catch (error) {
        console.error('❌ Error generating chart:', error);
        return null;
    }
}

// ===== CHART DISPLAY FUNCTION =====
function displayCompleteChart(chart) {
    console.log('🔄 Starting chart display...');
    
    // Remove previous displays
    const mothersContainer = document.getElementById('mothers-display-container');
    if (mothersContainer) {
        mothersContainer.remove();
    }

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.id = 'chart-container';
    chartContainer.className = 'chart-container';
    chartContainer.innerHTML = `
        <h3>مخطط الجيومانسي الكامل</h3>
        <div class="geomancy-tree">
            <!-- Chart will be built here -->
        </div>
        <div class="chart-buttons">
            <button id="save-chart-btn" class="btn-primary">💾 حفظ المخطط كصورة</button>
            <button id="new-reading-btn" class="btn-primary">قراءة جديدة</button>
        </div>
    `;

    // Insert after card stack
    const cardStackContainer = document.querySelector('.card-stack-container');
    if (cardStackContainer) {
        cardStackContainer.parentNode.insertBefore(chartContainer, cardStackContainer.nextSibling);
    }

    // Build the tree visualization
    buildTreeVisualization(chart);

    // Add save chart button functionality
    document.getElementById('save-chart-btn').addEventListener('click', function() {
        saveChartAsImage();
    });

    // Add new reading button
    document.getElementById('new-reading-btn').addEventListener('click', function() {
        resetGame();
        chartContainer.remove();
    });
}

// ===== TREE VISUALIZATION =====
function buildTreeVisualization(chart) {
    const treeElement = document.querySelector('.geomancy-tree');
    
    treeElement.innerHTML = `
        <!-- Row 5: Final Figure -->
        <div class="chart-row row-5">
            <div class="chart-figure" data-house="16">
                <div class="figure-lines">
                    ${chart.house16.points.map(point => 
                        `<div class="figure-line">${point === 1 ? '•' : '••'}</div>`
                    ).join('')}
                </div>
            </div>
        </div>

        <!-- Row 4: Judge -->
        <div class="chart-row row-4">
            <div class="chart-figure" data-house="15">
                <div class="figure-lines">
                    ${chart.house15.points.map(point => 
                        `<div class="figure-line">${point === 1 ? '•' : '••'}</div>`
                    ).join('')}
                </div>
            </div>
        </div>

        <!-- Row 3: Witnesses - RTL ORDER [13, 14] -->
        <div class="chart-row row-3">
            <div class="chart-figure" data-house="13">
                <div class="figure-lines">
                    ${chart.house13.points.map(point => 
                        `<div class="figure-line">${point === 1 ? '•' : '••'}</div>`
                    ).join('')}
                </div>
            </div>
            <div class="chart-figure" data-house="14">
                <div class="figure-lines">
                    ${chart.house14.points.map(point => 
                        `<div class="figure-line">${point === 1 ? '•' : '••'}</div>`
                    ).join('')}
                </div>
            </div>
        </div>

        <!-- Row 2: Nephews - RTL ORDER [9, 10, 11, 12] -->
        <div class="chart-row row-2">
            ${[9, 10, 11, 12].map(houseNum => `
                <div class="chart-figure" data-house="${houseNum}">
                    <div class="figure-lines">
                        ${chart['house' + houseNum].points.map(point => 
                            `<div class="figure-line">${point === 1 ? '•' : '••'}</div>`
                        ).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Row 1: Mothers & Daughters - RTL ORDER [1, 2, 3, 4, 5, 6, 7, 8] -->
        <div class="chart-row row-1">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(houseNum => `
                <div class="chart-figure" data-house="${houseNum}">
                    <div class="figure-lines">
                        ${chart['house' + houseNum].points.map(point => 
                            `<div class="figure-line">${point === 1 ? '•' : '••'}</div>`
                        ).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== SAVE CHART AS IMAGE =====
function saveChartAsImage() {
    console.log('💾 Saving chart as image...');
    
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) {
        console.error('❌ Chart container not found');
        return;
    }

    // Show loading state
    const saveBtn = document.getElementById('save-chart-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '⏳ جاري الحفظ...';
    saveBtn.disabled = true;

    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
        // Load html2canvas dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = function() {
            captureChart();
        };
        script.onerror = function() {
            handleSaveError(saveBtn, originalText, 'Failed to load html2canvas');
        };
        document.head.appendChild(script);
    } else {
        captureChart();
    }

    function captureChart() {
        try {
            html2canvas(chartContainer, {
                scale: 2,
                backgroundColor: '#0F1020',
                useCORS: true
            }).then(canvas => {
                // Convert to image and download
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                const timestamp = new Date().toISOString().split('T')[0];
                link.download = `geomancy-chart-${timestamp}.png`;
                link.href = image;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Restore button
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
                console.log('✅ Chart saved successfully!');
                
            }).catch(error => {
                handleSaveError(saveBtn, originalText, error);
            });
        } catch (error) {
            handleSaveError(saveBtn, originalText, error);
        }
    }

    function handleSaveError(btn, originalText, error) {
        console.error('❌ Error saving chart:', error);
        btn.textContent = originalText;
        btn.disabled = false;
        alert('عذراً، حدث خطأ في حفظ الصورة. يرجى استخدام لقطة الشاشة يدوياً.');
    }
}

// ===== RESULTS SCREEN =====
function showResultsScreen() {
    console.log('🎉 All mothers selected! Generating complete chart...');
    
    const chart = generateCompleteChart();
    if (!chart) {
        console.error('Failed to generate chart');
        return;
    }
    
    displayCompleteChart(chart);
}

// ===== CARD CLICK HANDLER =====
function handleCardClick(card, index) {
    // Prevent multiple selections during animation
    if (gameState.isSelecting) return;
    if (gameState.currentMother > gameState.maxMothers) return;
    
    console.log(`✅ Card ${index + 1} clicked for Mother ${gameState.currentMother}!`);
    
    // Set selecting state
    gameState.isSelecting = true;
    
    // Disable clicking on other cards during animation
    if (typeof window.disableAllCards === 'function') {
        window.disableAllCards();
    }
    
    // Step 1: Extract and raise card
    card.style.transform = 'translateY(-25px) scale(1.05)';
    card.style.zIndex = 200;
    card.style.transition = 'all 0.3s ease';
    
    // Step 2: Wait a moment, then flip the card
    setTimeout(function() {
        // Flip the card to show geomancy figure (front)
        card.classList.add('flipped');
        
        const figureIndex = parseInt(card.getAttribute('data-figure-index'));
        const selectedFigure = window.geomancyFigures[figureIndex];
        
        console.log(`🔮 Mother ${gameState.currentMother}: ${selectedFigure.name}`);
        
        // Store the selected figure
        gameState.selectedMothers.push(selectedFigure);
        
        // Update the mother display
        updateMotherDisplay();
        
        // Update progress
        updateProgress();
        
        // Step 3: After showing figure, process selection
        setTimeout(function() {
            // Flip card back to red back
            card.classList.remove('flipped');
            
            // Wait for flip back to complete, then return to deck
            setTimeout(function() {
                // Lower card back to deck position
                card.style.transform = 'translateY(0) scale(1)';
                card.classList.add('returning');
                
                // After return animation completes, reset and shuffle
                setTimeout(function() {
                    card.classList.remove('returning');
                    card.style.zIndex = '';
                    
                    // Move to next mother
                    gameState.currentMother++;
                    gameState.isSelecting = false;
                    
                    // Only shuffle if there are more mothers to select
                    if (gameState.currentMother <= gameState.maxMothers) {
                        if (typeof window.shuffleCards === 'function') {
                            window.shuffleCards();
                        }
                    } else {
                        if (typeof window.enableAllCards === 'function') {
                            window.enableAllCards();
                        }
                        showResultsScreen();
                    }
                }, 500);
                
            }, 300);
            
        }, 2000);
        
    }, 300);
}

// ===== RESET GAME =====
function resetGame() {
    gameState = {
        currentMother: 1,
        selectedMothers: [],
        isSelecting: false,
        maxMothers: 4
    };
    
    // Clear mother display
    const mothersRow = document.getElementById('mothers-row');
    if (mothersRow) {
        mothersRow.innerHTML = '';
    }
    
    // Clear any chart container
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
        chartContainer.remove();
    }
    
    // Reset progress
    updateProgress();
    
    // Recreate mother display container
    createMotherDisplayContainer();
}

// ===== INITIALIZE GAME PROGRESSION =====
function initializeGameProgression() {
    createMotherDisplayContainer();
    updateProgress();
}

// Make functions globally available
window.initializeGameProgression = initializeGameProgression;
window.handleCardClick = handleCardClick;
window.updateMotherDisplay = updateMotherDisplay;