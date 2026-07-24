document.addEventListener('DOMContentLoaded', () => {
    // --- Splash Screen ---
    const splashScreen = document.getElementById('splashScreen');
    const splashContent = document.getElementById('splashContent');
    const splashCredit = document.getElementById('splashCredit');
    
    if (splashScreen && splashContent) {
        // Trigger fade in and scale up on load
        setTimeout(() => {
            splashContent.classList.remove('scale-90', 'opacity-0');
            splashContent.classList.add('scale-100', 'opacity-100');
            
            if (splashCredit) {
                splashCredit.classList.remove('opacity-0');
            }
        }, 50);

        // Hide splash screen after 2 seconds
        setTimeout(() => {
            splashScreen.classList.add('opacity-0');
            setTimeout(() => {
                splashScreen.remove();
            }, 500); // Wait for fade-out transition (500ms duration)
        }, 2000);
    }

    // --- Theme Management ---
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Check local storage or system preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        if (htmlElement.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Tab Management ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => {
                b.classList.remove('active', 'text-primary', 'dark:text-indigo-400');
                b.classList.add('text-slate-500', 'dark:text-slate-400');
            });
            tabContents.forEach(c => {
                c.classList.remove('active', 'block');
                c.classList.add('hidden');
                // Removed manual transform style, letting CSS handle it
                c.style.transform = '';
            });

            // Add active class to clicked
            btn.classList.add('active');
            btn.classList.remove('text-slate-500', 'dark:text-slate-400');
            
            const targetId = btn.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            // Show the target content
            targetContent.classList.remove('hidden');
            targetContent.classList.add('block');
            
            // Trigger reflow for animation
            void targetContent.offsetWidth;
            
            // Add active class to trigger CSS transition
            targetContent.classList.add('active');
        });
    });

    // --- Trip Cost Calculator ---
    const distanceInput = document.getElementById('distance');
    
    // Fuel Mode Inputs
    const mileageInput = document.getElementById('mileage');
    const priceInput = document.getElementById('price');
    
    // EV Mode Inputs
    const evCapacityInput = document.getElementById('evCapacity');
    const evRangeInput = document.getElementById('evRange');
    const evRateInput = document.getElementById('evRate');
    
    // Split Expense Input
    const passengersInput = document.getElementById('passengers');

    // UI Elements
    const tripFuelBtn = document.getElementById('tripFuelBtn');
    const tripEvBtn = document.getElementById('tripEvBtn');
    const tripFuelGroup = document.getElementById('tripFuelGroup');
    const tripEvGroup = document.getElementById('tripEvGroup');
    const roundTripCheck = document.getElementById('roundTrip');
    const calcTripBtn = document.getElementById('calcTripBtn');
    const resetTripBtn = document.getElementById('resetTrip');
    const tripResultBox = document.getElementById('tripResult');
    
    const tripCostValue = document.getElementById('tripCostValue');
    const tripCostLabel = document.getElementById('tripCostLabel');
    const tripFuelLabel = document.getElementById('tripFuelLabel');
    const tripFuelValue = document.getElementById('tripFuelValue');
    const roundTripDetails = document.getElementById('roundTripDetails');
    const oneWayCostValue = document.getElementById('oneWayCostValue');
    const perPersonDetails = document.getElementById('perPersonDetails');
    const perPersonCostValue = document.getElementById('perPersonCostValue');
    const evSavingsDetails = document.getElementById('evSavingsDetails');
    const evSavingsValue = document.getElementById('evSavingsValue');

    let tripMode = 'fuel';

    function setTripMode(mode) {
        tripMode = mode;
        if (mode === 'fuel') {
            tripFuelBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-primary', 'shadow-sm');
            tripFuelBtn.classList.remove('text-slate-500', 'hover:text-slate-700', 'dark:hover:text-slate-300');
            tripEvBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-primary', 'shadow-sm');
            tripEvBtn.classList.add('text-slate-500', 'hover:text-slate-700', 'dark:hover:text-slate-300');
            
            tripFuelGroup.classList.remove('hidden');
            tripFuelGroup.classList.add('grid');
            tripEvGroup.classList.add('hidden');
            tripEvGroup.classList.remove('grid');
            
            tripFuelLabel.textContent = 'Fuel Needed';
            evSavingsDetails.classList.add('hidden');
        } else {
            tripEvBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-primary', 'shadow-sm');
            tripEvBtn.classList.remove('text-slate-500', 'hover:text-slate-700', 'dark:hover:text-slate-300');
            tripFuelBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-primary', 'shadow-sm');
            tripFuelBtn.classList.add('text-slate-500', 'hover:text-slate-700', 'dark:hover:text-slate-300');
            
            tripEvGroup.classList.remove('hidden');
            tripEvGroup.classList.add('grid');
            tripFuelGroup.classList.add('hidden');
            tripFuelGroup.classList.remove('grid');
            
            tripFuelLabel.textContent = 'Battery Used';
        }
    }

    tripFuelBtn.addEventListener('click', () => setTripMode('fuel'));
    tripEvBtn.addEventListener('click', () => setTripMode('ev'));

    function calculateTrip() {
        const dist = parseFloat(distanceInput.value);
        const isRound = roundTripCheck.checked;
        const passCount = parseInt(passengersInput.value) || 1;

        if (!dist || dist <= 0) {
            alert('Please enter a valid positive distance.');
            return;
        }

        const oneWayDistance = dist;
        const totalDistance = isRound ? dist * 2 : dist;
        
        let totalCost = 0;
        let oneWayCost = 0;
        let resourceNeeded = 0;

        if (tripMode === 'fuel') {
            const mil = parseFloat(mileageInput.value);
            const price = parseFloat(priceInput.value);
            
            if (!mil || !price || mil <= 0 || price <= 0) {
                alert('Please enter valid positive numbers for all fuel fields.');
                return;
            }
            
            resourceNeeded = totalDistance / mil;
            totalCost = resourceNeeded * price;
            oneWayCost = (oneWayDistance / mil) * price;
            
            tripFuelValue.textContent = resourceNeeded.toFixed(2) + ' L';
            evSavingsDetails.classList.add('hidden');
        } else {
            const cap = parseFloat(evCapacityInput.value);
            const range = parseFloat(evRangeInput.value);
            const rate = parseFloat(evRateInput.value);
            
            if (!cap || !range || !rate || cap <= 0 || range <= 0 || rate <= 0) {
                alert('Please enter valid positive numbers for all EV fields.');
                return;
            }
            
            resourceNeeded = (totalDistance / range) * cap;
            totalCost = resourceNeeded * rate;
            oneWayCost = ((oneWayDistance / range) * cap) * rate;
            
            tripFuelValue.textContent = resourceNeeded.toFixed(2) + ' kWh';
            
            // Calculate savings vs standard petrol car (15km/l @ 105 ₹/l)
            const petrolCost = (totalDistance / 15) * 105;
            const savings = Math.max(0, petrolCost - totalCost);
            evSavingsValue.textContent = '₹' + savings.toLocaleString('en-IN', { maximumFractionDigits: 2 });
            evSavingsDetails.classList.remove('hidden');
        }

        // Animate total cost
        animateValue(tripCostValue, totalCost, '₹');
        
        if (isRound) {
            roundTripDetails.classList.remove('hidden');
            oneWayCostValue.textContent = '₹' + oneWayCost.toLocaleString('en-IN', { maximumFractionDigits: 2 });
            tripCostLabel.textContent = 'Round Trip Total';
        } else {
            roundTripDetails.classList.add('hidden');
            tripCostLabel.textContent = 'Total Cost';
        }
        
        // Split cost logic
        if (passCount > 1) {
            const perPersonCost = totalCost / passCount;
            perPersonCostValue.textContent = '₹' + perPersonCost.toLocaleString('en-IN', { maximumFractionDigits: 2 });
            perPersonDetails.classList.remove('hidden');
        } else {
            perPersonDetails.classList.add('hidden');
        }

        // Store current trip data for saving/sharing
        currentTripData = {
            id: Date.now(),
            date: new Date().toLocaleDateString('en-GB'),
            type: tripMode === 'fuel' ? 'Fuel' : 'EV',
            distance: totalDistance,
            cost: totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
            perPerson: passCount > 1 ? (totalCost / passCount).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : null
        };

        tripResultBox.classList.remove('hidden');
        setTimeout(() => {
            tripResultBox.classList.add('show');
        }, 10);
    }

    function resetTrip() {
        distanceInput.value = '';
        mileageInput.value = '';
        evCapacityInput.value = '';
        evRangeInput.value = '';
        evRateInput.value = '';
        passengersInput.value = '1';
        // price kept as is since it's likely constant for the user

        roundTripCheck.checked = false;
        tripResultBox.classList.remove('show');
        setTimeout(() => {
            tripResultBox.classList.add('hidden');
        }, 500); // Wait for transition
    }

    calcTripBtn.addEventListener('click', calculateTrip);
    resetTripBtn.addEventListener('click', resetTrip);

    // --- History & Sharing ---
    const saveTripBtn = document.getElementById('saveTripBtn');
    const copyTripBtn = document.getElementById('copyTripBtn');
    const shareTripBtn = document.getElementById('shareTripBtn');
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const emptyHistoryMsg = document.getElementById('emptyHistoryMsg');

    let tripHistory = JSON.parse(localStorage.getItem('fuelCalcTrips')) || [];
    let currentTripData = null;
    
    function renderHistory() {
        if (tripHistory.length === 0) {
            historySection.classList.add('hidden');
            return;
        }
        
        historySection.classList.remove('hidden');
        emptyHistoryMsg.style.display = 'none';
        
        // Remove existing items except empty message
        const items = historyList.querySelectorAll('.history-item');
        items.forEach(item => item.remove());
        
        tripHistory.forEach(trip => {
            const el = document.createElement('div');
            el.className = 'history-item flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50';
            el.innerHTML = `
                <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-0.5">${trip.date} • <span class="font-medium ${trip.type === 'EV' ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary dark:text-indigo-400'}">${trip.type}</span></p>
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">${trip.distance} km</p>
                </div>
                <div class="text-right">
                    <p class="text-sm font-bold text-slate-800 dark:text-white">₹${trip.cost}</p>
                </div>
            `;
            historyList.appendChild(el);
        });
    }

    renderHistory();

    saveTripBtn.addEventListener('click', () => {
        if (!currentTripData) return;
        
        saveTripBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        saveTripBtn.classList.add('bg-green-500', 'text-white');
        setTimeout(() => {
            saveTripBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
            saveTripBtn.classList.remove('bg-green-500', 'text-white');
        }, 1500);

        tripHistory.unshift(currentTripData);
        if (tripHistory.length > 5) tripHistory.pop();
        
        localStorage.setItem('fuelCalcTrips', JSON.stringify(tripHistory));
        renderHistory();
    });

    clearHistoryBtn.addEventListener('click', () => {
        tripHistory = [];
        localStorage.removeItem('fuelCalcTrips');
        emptyHistoryMsg.style.display = 'block';
        renderHistory();
    });

    function getSummaryText() {
        if (!currentTripData) return '';
        let text = `🚗 *Trip Cost Summary*\n`;
        text += `• Distance: ${currentTripData.distance} km\n`;
        text += `• Mode: ${currentTripData.type}\n`;
        text += `• Total Cost: ₹${currentTripData.cost}\n`;
        if (currentTripData.perPerson) {
            text += `• Per Person: ₹${currentTripData.perPerson}\n`;
        }
        text += `\nCalculated via FuelCalc ⛽`;
        return text;
    }

    copyTripBtn.addEventListener('click', () => {
        const text = getSummaryText();
        if (!text) return;
        
        navigator.clipboard.writeText(text).then(() => {
            copyTripBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            copyTripBtn.classList.add('text-green-500');
            setTimeout(() => {
                copyTripBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
                copyTripBtn.classList.remove('text-green-500');
            }, 1500);
        }).catch(err => alert("Copy failed."));
    });

    shareTripBtn.addEventListener('click', () => {
        const text = getSummaryText();
        if (!text) return;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    });

    // --- Mileage Calculator ---
    const milDistanceInput = document.getElementById('milDistance');
    const milFuelInput = document.getElementById('milFuel');
    const milAmountInput = document.getElementById('milAmount');
    const milPriceInput = document.getElementById('milPrice');
    
    const modeLitersBtn = document.getElementById('modeLitersBtn');
    const modeAmountBtn = document.getElementById('modeAmountBtn');
    const milFuelGroup = document.getElementById('milFuelGroup');
    const milAmountGroup = document.getElementById('milAmountGroup');

    const calcMilBtn = document.getElementById('calcMilBtn');
    const resetMilBtn = document.getElementById('resetMil');
    const milResultBox = document.getElementById('milResult');
    
    const milValueEl = document.getElementById('milValue');
    const milStatusText = document.getElementById('milStatusText');
    const milStatusDot = document.getElementById('milStatusDot');
    const milStatusBg = document.getElementById('milStatusBg');
    const milEquivalentNote = document.getElementById('milEquivalentNote');
    const milEquivalentValue = document.getElementById('milEquivalentValue');

    let milMode = 'liters';

    function setMilMode(mode) {
        milMode = mode;
        if (mode === 'liters') {
            modeLitersBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-secondary', 'shadow-sm');
            modeLitersBtn.classList.remove('text-slate-500', 'hover:text-slate-700', 'dark:hover:text-slate-300');
            
            modeAmountBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-secondary', 'shadow-sm');
            modeAmountBtn.classList.add('text-slate-500', 'hover:text-slate-700', 'dark:hover:text-slate-300');
            
            milFuelGroup.classList.remove('hidden');
            milFuelGroup.classList.add('block');
            milAmountGroup.classList.add('hidden');
        } else {
            modeAmountBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-secondary', 'shadow-sm');
            modeAmountBtn.classList.remove('text-slate-500', 'hover:text-slate-700', 'dark:hover:text-slate-300');
            
            modeLitersBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-secondary', 'shadow-sm');
            modeLitersBtn.classList.add('text-slate-500', 'hover:text-slate-700', 'dark:hover:text-slate-300');
            
            milFuelGroup.classList.add('hidden');
            milFuelGroup.classList.remove('block');
            milAmountGroup.classList.remove('hidden');
        }
    }

    modeLitersBtn.addEventListener('click', () => setMilMode('liters'));
    modeAmountBtn.addEventListener('click', () => setMilMode('amount'));

    function calculateMileage() {
        const dist = parseFloat(milDistanceInput.value);
        let fuel = 0;
        let isAmountMode = milMode === 'amount';

        if (isAmountMode) {
            const amount = parseFloat(milAmountInput.value);
            const price = parseFloat(milPriceInput.value);
            if (!dist || !amount || !price || dist <= 0 || amount <= 0 || price <= 0) {
                alert('Please enter valid positive numbers for all fields.');
                return;
            }
            fuel = amount / price;
        } else {
            fuel = parseFloat(milFuelInput.value);
            if (!dist || !fuel || dist <= 0 || fuel <= 0) {
                alert('Please enter valid positive numbers for both fields.');
                return;
            }
        }

        const mileage = dist / fuel;
        animateValue(milValueEl, mileage, '', 1); // 1 decimal place

        // Determine status
        let status = 'Average';
        let colorClass = 'bg-yellow-500';
        let bgClass = 'bg-yellow-500/10 dark:bg-yellow-500/20';

        if (mileage >= 20) {
            status = 'Excellent';
            colorClass = 'bg-emerald-500';
            bgClass = 'bg-emerald-500/10 dark:bg-emerald-500/20';
        } else if (mileage >= 15) {
            status = 'Good';
            colorClass = 'bg-teal-500';
            bgClass = 'bg-teal-500/10 dark:bg-teal-500/20';
        } else if (mileage < 10) {
            status = 'Low';
            colorClass = 'bg-red-500';
            bgClass = 'bg-red-500/10 dark:bg-red-500/20';
        }

        milStatusText.textContent = status;
        milStatusDot.className = `w-2 h-2 rounded-full ${colorClass}`;
        milStatusBg.className = `absolute top-0 right-0 w-24 h-24 rounded-bl-full ${bgClass} -mr-4 -mt-4 transition-colors duration-500`;

        if (isAmountMode) {
            milEquivalentValue.textContent = fuel.toFixed(2);
            milEquivalentNote.classList.remove('hidden');
        } else {
            milEquivalentNote.classList.add('hidden');
        }

        milResultBox.classList.remove('hidden');
        setTimeout(() => {
            milResultBox.classList.add('show');
        }, 10);
    }

    function resetMileage() {
        milDistanceInput.value = '';
        milFuelInput.value = '';
        milAmountInput.value = '';
        milResultBox.classList.remove('show');
        setTimeout(() => {
            milResultBox.classList.add('hidden');
        }, 500);
    }

    calcMilBtn.addEventListener('click', calculateMileage);
    resetMilBtn.addEventListener('click', resetMileage);

    // --- Number Animation Helper ---
    function animateValue(obj, end, prefix = '', decimals = 2, duration = 800) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const current = (easeProgress * end).toFixed(decimals);
            
            // Format number with commas
            const formatted = parseFloat(current).toLocaleString('en-IN', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
            
            obj.innerHTML = prefix + formatted;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                const finalFormatted = end.toLocaleString('en-IN', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                });
                obj.innerHTML = prefix + finalFormatted;
            }
        };
        window.requestAnimationFrame(step);
    }

    // Allow Enter key to trigger calculation
    [distanceInput, mileageInput, priceInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculateTrip();
        });
    });

    [milDistanceInput, milFuelInput, milAmountInput, milPriceInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') calculateMileage();
            });
        }
    });
});
