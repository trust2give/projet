<?php
/*
Template Name: Donation Page
*/

get_header();
?>

<div class="container mx-auto">
    <!-- SVG Image -->
    <div class="w-full flex justify-center mb-8 bg-gradient-to-b from-indigo-300">
        <img src="<?php bloginfo('template_url'); ?>/assets/img/mains.svg" alt="Mains" class="w-1/3 max-w-4xl">
    </div>

    <!-- Page Title -->
    <h1 class="text-3xl md:text-4xl font-bold text-center mb-12">Faire un don</h1>

    <!-- Donation Form -->
    <form class="max-w-6xl mx-auto">
        <!-- First Section: Pictogram Grid -->
        <div class="mb-12">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <?php
                $categories = [
                    'mines', 'agriculture', 'medecine', 'association', 'peche', 
                    'banque', 'industrie', 'avion', 'transport', 'voiture', 
                    'loisirs', 'transport', 'justice'
                ];

                foreach ($categories as $category) :
                ?>
                    <label class="cursor-pointer group">
                        <input type="checkbox" name="category[]" value="<?php echo $category; ?>" class="hidden category-checkbox">
                        <div class="border-2 rounded-lg p-4 text-center transition-all duration-300 group-hover:border-indigo-500 group-hover:shadow-lg category-card">
                            <img src="<?php bloginfo('template_url'); ?>/assets/img/<?php echo $category; ?>.png" 
                                 alt="<?php echo ucfirst($category); ?>"
                                 class="w-16 h-16 mx-auto mb-2">
                            <span class="block text-sm font-medium"><?php echo ucfirst($category); ?></span>
                        </div>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>

        <hr class="my-8 border-gray-300">

        <!-- Second Section: User Details -->
        <div class="mb-12">
            <div class="grid md:grid-cols-2 gap-8">
                <!-- First Column -->
                <div class="space-y-4">
                    <div class="flex items-center mb-4">
                        <label class="flex items-center cursor-pointer">
                            <span class="mr-3">Company</span>
                            <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                <input type="checkbox" name="is_company" id="company-switch" 
                                       class="absolute w-6 h-6 opacity-0 z-10 cursor-pointer peer">
                                <div class="block h-6 w-12 rounded-full bg-gray-300 peer-checked:bg-indigo-400"></div>
                                <div class="absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-300 bg-white peer-checked:translate-x-6"></div>
                            </div>
                        </label>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Genre</label>
                            <select name="gender" class="w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="mr">M.</option>
                                <option value="mrs">Mme</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Nom</label>
                            <input type="text" name="lastname" class="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Prénom</label>
                            <input type="text" name="firstname" class="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Email</label>
                            <input type="email" name="email" class="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                    </div>
                </div>

                <!-- Second Column -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Adresse 1</label>
                        <input type="text" name="address1" class="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Adresse 2</label>
                        <input type="text" name="address2" class="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Code Postal</label>
                        <input type="text" name="postcode" class="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Ville</label>
                        <input type="text" name="city" class="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Pays</label>
                        <input type="text" name="country" class="p-2 w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                </div>
            </div>
        </div>

        <hr class="my-8 border-gray-300">

        <!-- Third Section: Donation Amount -->
        <div class="mb-8">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 justify-content-between">
                <?php
                $amounts = [25, 40, 50, 75, 100, 150];
                foreach ($amounts as $amount) :
                ?>
                    <label class="cursor-pointer group w-48">
                        <input type="radio" name="amount" value="<?php echo $amount; ?>" class="hidden amount-radio">
                        <div class="border-2 rounded-xl p-4 text-center transition-all duration-300 group-hover:border-indigo-500 group-hover:shadow-lg amount-card">
                            <span class="text-xl font-bold"><?php echo $amount; ?>€</span>
                        </div>
                    </label>
                <?php endforeach; ?>
                <div>
                    <input type="number" name="custom_amount" placeholder="Autre montant" 
                           class="w-full h-12 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 custom-amount">
                </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end">
                <button type="submit" class="bg-indigo-500 text-white px-8 py-3 rounded-xl hover:bg-indigo-600 transition-colors duration-300">
                    Faire un don
                </button>
            </div>
        </div>
    </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Handle category selection
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const card = this.parentElement.querySelector('.category-card');
            if (this.checked) {
                card.classList.add('border-indigo-500', 'border-4', 'shadow-lg');
                card.classList.remove('border-2');
            } else {
                card.classList.remove('border-indigo-500', 'border-4', 'shadow-lg');
                card.classList.add('border-2');
            }
        });
    });

    // Handle amount selection
    const amountRadios = document.querySelectorAll('.amount-radio');
    const customAmount = document.querySelector('.custom-amount');
    
    function clearAmountSelections() {
        amountRadios.forEach(radio => {
            const card = radio.parentElement.querySelector('.amount-card');
            card.classList.remove('border-indigo-500', 'border-4', 'shadow-lg');
            card.classList.add('border-2');
        });
    }

    amountRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            clearAmountSelections();
            if (this.checked) {
                const card = this.parentElement.querySelector('.amount-card');
                card.classList.add('border-indigo-500', 'border-4', 'shadow-lg');
                card.classList.remove('border-2');
                customAmount.value = ''; // Clear custom amount when preset amount is selected
            }
        });
    });

    // Handle custom amount input
    customAmount.addEventListener('input', function() {
        if (this.value) {
            clearAmountSelections();
            amountRadios.forEach(radio => radio.checked = false);
        }
    });

    // Add switch button functionality
    const companySwitch = document.getElementById('company-switch');
    companySwitch.addEventListener('change', function() {
        // You can add additional functionality here when the switch changes
        console.log('Company switch changed:', this.checked);
    });
});
</script>

<?php get_footer(); ?>
