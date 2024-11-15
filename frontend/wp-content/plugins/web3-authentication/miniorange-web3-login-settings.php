<?php
/**
 * Web3 - Crypto wallet Login & NFT token gating
 *
 * @package    miniOrange-web3-authentication
 * @author     miniOrange <info@miniorange.com>
 * @license    MIT/Expat
 * @link       https://miniorange.com
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Plugin Name: Web3 - Crypto wallet Login & NFT token gating
 * Plugin URI: http://miniorange.com
 * Description: WordPress WEB3 authentication allows the functionality to auto login, auto register into WordPress using the WEB3 Crypto wallet like metamask.
 * Version: 3.1.4
 * Author: miniOrange
 * License: MIT/Expat
 * License URI: https://docs.miniorange.com/mit-license
 */

require_once '-autoload.php';
use MoWeb3\Base\MoWeb3BaseStructure;
use MoWeb3\Base\MoWeb3InstanceHelper;
use MoWeb3\controller\MoWeb3FlowHandler;
use MoWeb3\view\ButtonView\MoWeb3View;
use MoWeb3\controller\MoWeb3DemoFlowHandler;

global $mo_web3_util;


$instance_helper  = new MoWeb3InstanceHelper();
$base             = new MoWeb3BaseStructure();
$web3_flow        = new MoWeb3FlowHandler();
$web3_button_view = new MoWeb3View();
$demo_flow        = new MoWeb3DemoFlowHandler();


$mo_web3_util                = $instance_helper->get_utils_instance();
$settings                    = $instance_helper->get_settings_instance();
$config_settings_all_methods = $instance_helper->get_all_method_instances();


mo_web3_load_all_methods( $config_settings_all_methods );



/**
 * Delete account details on plugin deactivation
 */
function mo_web3_deactivate() {
	global $mo_web3_util;
	remove_menu_page( 'mo_web3_settings' );
	// delete all stored key-value pairs.
	do_action( 'mo_web3_clear_plug_cache' );
	$mo_web3_util->deactivate_plugin();
}

/**
 * Enable default settings on plugin activation
 */
function mo_web3_activate() {
	global $mo_web3_util;
	$existing_plugin_version = $mo_web3_util->mo_web3_get_option( 'mo_web3_plugin_version' );
	$current_plugin_version  = \mo_web3_get_version_number();
	$mo_web3_util->mo_web3_update_option( 'mo_web3_plugin_activation_time', time() );
	if ( false === $existing_plugin_version ) {
		$mo_web3_util->mo_web3_update_option( 'mo_web3_plugin_version', $current_plugin_version );
	}

	$is_wallet_preconfigured             = $mo_web3_util->mo_web3_get_option( 'mo_web3_display_multiple_button' );
	$is_wallet_button_text_preconfigured = $mo_web3_util->mo_web3_get_option( 'mo_web3_button_custom_text' );

	if ( false === $is_wallet_preconfigured ) {
		$default_wallets                        = array();
		$default_wallets['moweb3MetaMask']      = 'checked';
		$default_wallets['moweb3WalletConnect'] = 'checked';
		$default_wallets['moweb3Coinbase']      = 'checked';
		$mo_web3_util->mo_web3_update_option( 'mo_web3_display_multiple_button', $default_wallets );
	}

}

/**
 * Redirect to plugin settings on plugin activation
 *
 * @param string $plugin plugin base URL.
 */

register_activation_hook( __FILE__, 'mo_web3_activate' );

register_deactivation_hook( __FILE__, 'mo_web3_deactivate' );







