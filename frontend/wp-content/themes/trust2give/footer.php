<!-- <footer class="bg-gray-800 text-white mt-auto">
        <div class="container mx-auto px-4 py-8">
            <div class="flex flex-wrap justify-between">
                <div class="w-full md:w-1/3 mb-4 md:mb-0">
                    <h3 class="text-xl font-bold mb-2">About Us</h3>
                    <p><?php //echo get_theme_mod('footer_about', 'Add your about text here.'); ?></p>
                </div>
                <div class="w-full md:w-1/3 mb-4 md:mb-0">
                    <h3 class="text-xl font-bold mb-2">Quick Links</h3>
                    <?php
                    // wp_nav_menu(array(
                    //     'theme_location' => 'footer-menu',
                    //     'container' => false,
                    //     'menu_class' => 'list-none',
                    //     'fallback_cb' => false,
                    // ));
                    ?>
                </div>
                <div class="w-full md:w-1/3">
                    <h3 class="text-xl font-bold mb-2">Contact Us</h3>
                    <p><?php //echo get_theme_mod('footer_contact', 'Add your contact information here.'); ?></p>
                </div>
            </div>
            <div class="mt-8 text-center">
                <p>&copy; <?php //echo date('Y'); ?> <?php //bloginfo('name'); ?>. All rights reserved.</p>
            </div>
        </div>
    </footer> -->
    <?php wp_footer(); ?>
    <script>
// Burger menus
document.addEventListener('DOMContentLoaded', function() {
    // open
    const burger = document.querySelectorAll('.navbar-burger');
    const menu = document.querySelectorAll('.navbar-menu');

    if (burger.length && menu.length) {
        for (var i = 0; i < burger.length; i++) {
            burger[i].addEventListener('click', function() {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }

    // close
    const close = document.querySelectorAll('.navbar-close');
    const backdrop = document.querySelectorAll('.navbar-backdrop');

    if (close.length) {
        for (var i = 0; i < close.length; i++) {
            close[i].addEventListener('click', function() {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }

    if (backdrop.length) {
        for (var i = 0; i < backdrop.length; i++) {
            backdrop[i].addEventListener('click', function() {
                for (var j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }
});
</script>

</body>
</html>