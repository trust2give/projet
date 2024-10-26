<?php

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