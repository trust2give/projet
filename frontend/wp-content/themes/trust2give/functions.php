<?php
require_once __DIR__ . '/lib/Vite.php';
// require_once __DIR__ . '/lib/Theme.php';
function trust2give_setup() 
{
    add_theme_support('title-tag');
    add_theme_support('custom-logo');
    wp_register_style('tailwind', '/wp-content/themes/trust2give/style.css');
    wp_enqueue_style('tailwind');
    register_nav_menus(array(
        'primary-menu' => __('Primary Menu', 'trust2give'),
        'footer-menu' => __('Footer Menu', 'trust2give'),
    ));
}
add_action('after_setup_theme', 'trust2give_setup');

function trust2give_enqueue_scripts()
{
    // Previous enqueues remain...
    // Enqueue Web3 script
    wp_enqueue_script(
        'web3',
        '/wp-content/themes/trust2give/assets/js/build/main.js',
        [],
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'trust2give_enqueue_scripts');