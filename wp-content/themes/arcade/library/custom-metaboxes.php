<?php
class Bavotasan_Custom_Metaboxes {
	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'add_custom_metabox' ) );
		add_action( 'pre_post_update', array( $this, 'pre_post_update' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
	}

	/**
	 * Enqueue script to select image on post edit screen
	 *
	 * This function is attached to the 'admin_enqueue_scripts' action hook.
	 *
	 * @since 1.0.0
	 */
	public function admin_enqueue_scripts( $hook ) {
		if ( 'post.php' == $hook || 'post-new.php' == $hook )
		    wp_enqueue_script( 'custom_image', BAVOTASAN_THEME_URL . '/library/js/admin/custom-image.js', array( 'jquery' ), '', true );
	}

	/**
	 * Add option for full width posts & pages
	 *
	 * This function is attached to the 'add_meta_boxes' action hook.
	 *
	 * @since 1.0.0
	 */
	public function add_custom_metabox() {
		add_meta_box( 'theme-layout-options', __( 'Layout', 'arcade' ), array( $this, 'layout_option' ), 'post', 'side', 'high' );
		add_meta_box( 'theme-layout-options', __( 'Layout', 'arcade' ), array( $this, 'layout_option' ), 'page', 'side', 'high' );

		add_meta_box( 'theme-slider-image', __( 'Custom Header Image', 'arcade' ), array( $this, 'custom_image' ), 'post', 'normal', 'high' );
		add_meta_box( 'theme-slider-image', __( 'Custom Header Image', 'arcade' ), array( $this, 'custom_image' ), 'page', 'normal', 'high' );
	}

	public function layout_option( $post ) {
		$layout = get_post_meta( $post->ID, 'arcade_single_layout', true );

		// Use nonce for verification
		wp_nonce_field( 'arcade_nonce', 'arcade_nonce' );

		echo '<input id="arcade_single_layout" name="arcade_single_layout" type="checkbox" '; checked( $layout, 'on' ); echo ' /> <label for="arcade_single_layout">' . __( 'Display at full width', 'arcade' ) . '</label>';
	}

	public function custom_image( $post ) {
		$slider_image = get_post_meta( $post->ID, 'arcade_custom_image', true );
		$img_src = ( $slider_image ) ? '<img src="' . esc_url( $slider_image ) . '" alt="" style="max-width:100%;" />' : '';
		$remove = ( $slider_image ) ? '<button class="button delete_image">' . __( 'Remove Image', 'arcade' ) . '</button>' : '<button class="button delete_image" style="display: none;">' . __( 'Remove Image', 'arcade' ) . '</button>';

		// Use nonce for verification
		wp_nonce_field( 'arcade_nonce', 'arcade_nonce' );

		echo '<p id="custom-image-container">' . $img_src . '</p>';
		echo '<input type="hidden" id="arcade_custom_image" name="arcade_custom_image" value="' . esc_attr( $slider_image ) . '" />';
		echo '<p><button class="button-primary select_image">' . __( 'Set Image', 'arcade' ) . '</button> ' . $remove . '</p>';
		echo '<p>' . __( 'Set a custom image for the header if you want to use something other than the featured image.', 'arcade' ) . '</p>';
	}

	/**
	 * Save post custom fields
	 *
	 * This function is attached to the 'pre_post_update' action hook.
	 *
	 * @since 1.0.0
	 */
	public function pre_post_update( $post_id ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
			return;

		// Check if quick edit
		if ( ! empty( $_POST['_inline_edit'] ) && wp_verify_nonce( $_POST['_inline_edit'], 'inlineeditnonce' ) )
			return;

		if ( ! empty( $_POST['arcade_nonce'] ) && ! wp_verify_nonce( $_POST['arcade_nonce'], 'arcade_nonce' ) )
			return;

		if ( ! empty( $_POST['post_type'] ) && 'page' == $_POST['post_type'] ) {
			if ( ! current_user_can( 'edit_page', $post_id ) )
				return;
		} else {
			if ( ! current_user_can( 'edit_post', $post_id ) )
				return;
		}

		// Sanitize
		$arcade_single_layout = ( isset( $_POST['arcade_single_layout'] ) && 'on' == $_POST['arcade_single_layout'] ) ? 'on' : '';
		$arcade_custom_image = ( isset( $_POST['arcade_custom_image'] ) ) ? esc_url_raw( $_POST['arcade_custom_image'] ) : '';

		$this->save_meta_value( $post_id, 'arcade_single_layout', $arcade_single_layout );
		$this->save_meta_value( $post_id, 'arcade_custom_image', $arcade_custom_image );
	}

	/**
	 * Save meta helper function
	 *
	 * @param	int $post_id	The post id
	 * @param	string $name	The custom field meta key
	 *
	 * @since 1.0.0
	 */
	public function save_meta_value( $post_id, $name, $value ) {
		if ( $value )
			update_post_meta( $post_id, $name, $value );
		else
			delete_post_meta( $post_id, $name );
	}
}
$bavotasan_custom_metaboxes = new Bavotasan_Custom_Metaboxes;