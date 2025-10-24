// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 1. DOMContentLoaded fired - script is running!');
    
    // Geomancy figures data with dot representation - MAKE GLOBAL
    window.geomancyFigures = [
        { name: "Via", lines: "••  ••  ••  ••", points: [0,0,0,0], meaning: "The Way" },
        { name: "Cauda Draconis", lines: "••  ••  ••  •", points: [0,0,0,1], meaning: "Dragon's Tail" },
        { name: "Puer", lines: "••  ••  •  ••", points: [0,0,1,0], meaning: "The Boy" },
        { name: "Fortuna Minor", lines: "••  ••  •  •", points: [0,0,1,1], meaning: "Lesser Fortune" },
        { name: "Puella", lines: "••  •  ••  ••", points: [0,1,0,0], meaning: "The Maiden" },
        { name: "Amissio", lines: "••  •  ••  •", points: [0,1,0,1], meaning: "Loss" },
        { name: "Carcer", lines: "••  •  •  ••", points: [0,1,1,0], meaning: "The Prison" },
        { name: "Caput Draconis", lines: "••  •  •  •", points: [0,1,1,1], meaning: "Dragon's Head" },
        { name: "Conjunctio", lines: "•  ••  ••  ••", points: [1,0,0,0], meaning: "The Conjunction" },
        { name: "Albus", lines: "•  ••  ••  •", points: [1,0,0,1], meaning: "The White" },
        { name: "Rubeus", lines: "•  ••  •  ••", points: [1,0,1,0], meaning: "The Red" },
        { name: "Acquisitio", lines: "•  ••  •  •", points: [1,0,1,1], meaning: "Gain" },
        { name: "Fortuna Major", lines: "•  •  ••  ••", points: [1,1,0,0], meaning: "Greater Fortune" },
        { name: "Laetitia", lines: "•  •  ••  •", points: [1,1,0,1], meaning: "Joy" },
        { name: "Tristitia", lines: "•  •  •  ••", points: [1,1,1,0], meaning: "Sorrow" },
        { name: "Populus", lines: "•  •  •  •", points: [1,1,1,1], meaning: "The People" }
    ];

    // Get references to important elements
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startBtn = document.getElementById('start-btn');
    const cardStack = document.getElementById('card-stack');
    
    // Debug: Check if elements exist
    console.log('✅ 2. Element check:', {
        startScreen: !!startScreen,
        gameScreen: !!gameScreen, 
        startBtn: !!startBtn,
        cardStack: !!cardStack
    });
    
    // When Start Button is clicked
    startBtn.addEventListener('click', function() {
        console.log('✅ 3. Start button clicked!');
        
        // Hide start screen, show game screen
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Create the 16 cards
        createCards();
        
        // Add shuffle button
        addShuffleButton();
        
        // Initialize game progression (from game-progression.js)
        if (typeof initializeGameProgression === 'function') {
            initializeGameProgression();
        }
    });
    
    // Function to create the 16 cards with uniform backs and unique fronts
    function createCards() {
        console.log('✅ 4. Creating 16 geomancy cards with uniform backs...');
        
        // Clear any existing cards
        cardStack.innerHTML = '';
        
        // Create 16 cards with uniform backs and unique fronts
        for (let i = 0; i < 16; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-card-number', i + 1);
            card.setAttribute('data-figure-index', i);
            
           // In createCards() function, update the card HTML:
card.innerHTML = `
    <div class="card-front">
        <div class="geomancy-figure">
            <div class="figure-lines">
                <div class="figure-line">${geomancyFigures[i].lines.split('  ')[0]}</div>
                <div class="figure-line">${geomancyFigures[i].lines.split('  ')[1]}</div>
                <div class="figure-line">${geomancyFigures[i].lines.split('  ')[2]}</div>
                <div class="figure-line">${geomancyFigures[i].lines.split('  ')[3]}</div>
            </div>
            <div class="figure-name">${geomancyFigures[i].name}</div>
        </div>
    </div>
    <div class="card-back"></div>
`;
            
            // Add click event to each card
            card.addEventListener('click', function() {
                handleCardClick(card, i);
            });
            
            cardStack.appendChild(card);
        }
        
        // FIX: Ensure all cards start with backs visible
        setTimeout(() => {
            const allCards = document.querySelectorAll('.card');
            allCards.forEach(card => {
                card.classList.remove('flipped'); // Ensure no cards start flipped
            });
        }, 100);
        
        console.log('✅ 5. 16 cards created with uniform red backs!');
    }
    
    // Fallback basic card click (if game progression not loaded)
    function basicCardClick(card, index) {
        console.log(`🃏 Basic card click: Card ${index + 1}`);
        
        // Disable clicking on other cards during animation
        disableAllCards();
        
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
            
            console.log(`🔮 Revealed: ${selectedFigure.name} - ${selectedFigure.meaning}`);
            
            // Step 3: After showing figure, return card to deck
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
                        shuffleCards();
                        enableAllCards();
                    }, 500);
                    
                }, 300);
                
            }, 2000);
            
        }, 300);
    }
    
    // Function to disable all cards during animation
    function disableAllCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.pointerEvents = 'none';
        });
    }
    
    // Function to enable all cards after animation
    function enableAllCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.pointerEvents = 'auto';
            // Reset card to base state for hover
            card.style.transform = 'translateY(0) scale(1)';
            card.style.transition = 'all 0.3s ease';
            card.style.boxShadow = '';
        });
        console.log('✅ All cards enabled and ready for hover');
    }
    
    // ENHANCED shuffle function - More shuffling!
      // ENHANCED shuffle function - More shuffling!
      // ENHANCED shuffle function - Random arc movements!
        // ENHANCED shuffle function - Large Circular Arcs!
       // ENHANCED shuffle function - Bounded Circular Arcs!
       // SIMPLE shuffle function - Cards always visible!
       // SIMPLE shuffle function - Three shuffles!
    function shuffleCards() {
        console.log('✅ Starting THREE shuffle sequence...');
        
        const cards = Array.from(document.querySelectorAll('.card'));
        const totalCards = cards.length;
        
        // Disable cards during shuffle
        disableAllCards();
        
        // Clear any existing animations
        cards.forEach(card => {
            card.style.animation = 'none';
            card.style.transition = 'all 0.5s ease';
            card.classList.remove('shuffling');
        });
        
        // Force reflow
        cards[0].offsetHeight;
        
        function performSimpleShuffle(shuffleNumber) {
            return new Promise((resolve) => {
                console.log(`🎲 Shuffle ${shuffleNumber + 1} of 3...`);
                
                // Generate random target positions
                const targetPositions = [];
                for (let i = 0; i < totalCards; i++) {
                    targetPositions.push(i);
                }
                
                // Fisher-Yates shuffle
                for (let i = targetPositions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [targetPositions[i], targetPositions[j]] = [targetPositions[j], targetPositions[i]];
                }
                
                let animationsCompleted = 0;
                
                cards.forEach((card, currentIndex) => {
                    const targetIndex = targetPositions[currentIndex];
                    const targetRight = targetIndex * 5;
                    
                    // Vary animation parameters for each shuffle
                    const arcHeight = 60 + Math.random() * 40; // 60-100px arcs
                    const delay = currentIndex * (60 + shuffleNumber * 10); // Different timing each shuffle
                    
                    setTimeout(() => {
                        // Add shuffling class
                        card.classList.add('shuffling');
                        
                        // Simple arc movement
                        card.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
                        card.style.transform = `translateY(-${arcHeight}px)`;
                        card.style.zIndex = 200;
                        
                        // Move to target position during arc
                        setTimeout(() => {
                            card.style.right = targetRight + '%';
                        }, 350);
                        
                        // Complete the animation
                        setTimeout(() => {
                            card.style.transform = 'translateY(0)';
                            card.style.zIndex = 16 - targetIndex;
                            card.classList.remove('shuffling');
                            
                            animationsCompleted++;
                            if (animationsCompleted === totalCards) {
                                console.log(`✅ Shuffle ${shuffleNumber + 1} completed`);
                                resolve();
                            }
                        }, 700);
                    }, delay);
                });
            });
        }
        
        // Execute THREE shuffle sequence
        async function executeThreeShuffles() {
            console.log('🔄 Starting THREE shuffle sequence...');
            
            // First shuffle
            await performSimpleShuffle(0);
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Second shuffle
            await performSimpleShuffle(1);
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Third shuffle
            await performSimpleShuffle(2);
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Final cleanup
            setTimeout(() => {
                cards.forEach(card => {
                    card.style.pointerEvents = 'auto';
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.transition = 'all 0.3s ease';
                });
                
                enableAllCards();
                console.log('🎉 THREE SHUFFLES COMPLETED! Ready for selection.');
            }, 300);
        }
        
        // Start the three-shuffle sequence
        executeThreeShuffles();
    }
    
    // SHUFFLE BUTTON FUNCTION
    function addShuffleButton() {
        console.log('✅ 8. Adding shuffle button...');
        
        const shuffleBtn = document.createElement('button');
        shuffleBtn.textContent = '🔀 Shuffle Cards';
        shuffleBtn.id = 'shuffle-btn';
        shuffleBtn.className = 'btn-primary';
        shuffleBtn.style.cssText = `
            margin: 20px;
            padding: 12px 25px;
            background: linear-gradient(135deg, #6A0DAD 0%, #8A2BE2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s ease;
        `;
        
        // Add hover effect
        shuffleBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 20px rgba(138, 43, 226, 0.3)';
        });
        
        shuffleBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        shuffleBtn.addEventListener('click', function() {
            console.log('✅ Shuffle button clicked! Shuffling cards...');
            shuffleCards();
        });
        
        // Add to game screen
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.appendChild(shuffleBtn);
            console.log('✅ 9. Shuffle button added to game screen!');
        } else {
            console.error('❌ Game screen not found for shuffle button!');
        }
    }

    // ===== GLOBAL EXPORTS =====
    // Make core functions available to game-progression.js
    window.disableAllCards = disableAllCards;
    window.enableAllCards = enableAllCards;
    window.shuffleCards = shuffleCards;
});