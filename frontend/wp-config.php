<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'trust' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'root' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'NB<4x8q8qT}|/K})&p`Hm]vOmy#g.h%k-|%HwP6-zFMo;GAo:_?;3:Hxo!y~]c6Q' );
define( 'SECURE_AUTH_KEY',  'c^j%l4(y0gdaY^ v@W.~3#c@rKK*=+_=^_&t5J$VX[tkOT)qhrEyOdv-ysP}qY~I' );
define( 'LOGGED_IN_KEY',    'WHxGY;lxOaZ2!W<q58Ou:+qK29#5=o/=Qr59l?]eyH/Z|?rBdcL04;E=5!EoNK0Z' );
define( 'NONCE_KEY',        '+%&B@xoTYl5R&Oa@uAt2Ccz+&c_(X>yRkHXEs>isc*g#|L9}CCRbIu5MS={sf#Wn' );
define( 'AUTH_SALT',        '4wr$BV`/_MW8C7)HfO5614Gk,FaXgBVK$m!()x D=MK-hpYm)?9Yr9aFGwWB8RX[' );
define( 'SECURE_AUTH_SALT', 'h)8J/CJ/?1:WnVo UxAS(C:q5scOW>,378GFj_,LXt$FjhEC7lOcy_2{(;S=kXy=' );
define( 'LOGGED_IN_SALT',   '[pD[Y$rL<p;4}nn89T/Y?_iA/-M;@>)Q|zb*|vMsYb q;K4~eev&}KVShQ;nS<!K' );
define( 'NONCE_SALT',       'ZsbwRe>Z9TJPbthO}]3#Q[bX:Z8]sZPT;s1%~V+`N747wsgDka0qPy;Noh3 -3kE' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
