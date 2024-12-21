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
	wp_enqueue_script(
		'viem',
		'https://cdn.jsdelivr.net/npm/web3@4.16.0/dist/web3.min.js',
//		'https://cdn.jsdelivr.net/npm/viem@latest/dist/viem.min.js',
//		'/wp-content/themes/trust2give/assets/js/lib/viem.js',
		[/*'type' => 'module'*/],
		'1.0.0',
		true
	);
    wp_enqueue_script(
        'app',
        '/wp-content/themes/trust2give/assets/js/app.js',
        ['viem'/*'type' => 'module'*/],
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'trust2give_enqueue_scripts');