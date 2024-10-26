<?php 
/*
Template Name: Homepage
*/
?>

<?php get_header(); ?>

    <div class="mb-12 py-8 w-full bg-gradient-to-b from-indigo-300">
        <div class="flex w-full md:w-4/6 mx-auto">
            <div class="w-full sm:w-1/2 sm:align-items-center content-center">
                <h1 class="text-4xl font-bold mb-4"><?php echo get_the_title(); ?></h1>
                <?php echo get_the_content(); ?>
                <div class="place-content-center sm:place-content-end grid">
                    <a class="mt-4 lg:inline-block mx-auto lg:mr-3 py-2 border-2 px-6 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition duration-200"
                        href="#">
                        Faire un don
                    </a>
                </div>
            </div>
            <div class="hidden sm:inline-block w-1/2">
            	<img width="400" src="<?php bloginfo('template_url');?>/assets/img/terre.svg" class="mx-auto">
            </div>
        </div>
    </div>

    <section class="mb-12">
        <h2 class="text-3xl font-semibold mb-6">Featured Articles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php
            $featured_query = new WP_Query(array(
                'posts_per_page' => 3,
                'meta_key' => 'featured_post',
                'meta_value' => '1'
            ));

            while ($featured_query->have_posts()) : $featured_query->the_post();
            ?>
                <article class="bg-white shadow-md rounded-lg overflow-hidden">
                    <?php if (has_post_thumbnail()) : ?>
                        <div class="post-thumbnail">
                            <?php the_post_thumbnail('medium', ['class' => 'w-full h-48 object-cover']); ?>
                        </div>
                    <?php endif; ?>
                    <div class="p-4">
                        <h3 class="text-xl font-semibold mb-2">
                            <a href="<?php the_permalink(); ?>" class="text-blue-600 hover:text-blue-800"><?php the_title(); ?></a>
                        </h3>
                        <div class="text-sm text-gray-600 mb-2"><?php echo get_the_date(); ?></div>
                        <div class="prose max-w-none mb-4"><?php the_excerpt(); ?></div>
                        <a href="<?php the_permalink(); ?>" class="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">Read More</a>
                    </div>
                </article>
            <?php
            endwhile;
            wp_reset_postdata();
            ?>
        </div>
    </section>

    <!-- Recent Articles -->
    <section>
        <h2 class="text-3xl font-semibold mb-6">Recent Articles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <?php
            $recent_query = new WP_Query(array(
                'posts_per_page' => 6,
                'post__not_in' => wp_list_pluck($featured_query->posts, 'ID')
            ));

            while ($recent_query->have_posts()) : $recent_query->the_post();
            ?>
                <article class="bg-white shadow-md rounded-lg overflow-hidden flex">
                    <?php if (has_post_thumbnail()) : ?>
                        <div class="post-thumbnail w-1/3">
                            <?php the_post_thumbnail('thumbnail', ['class' => 'w-full h-full object-cover']); ?>
                        </div>
                    <?php endif; ?>
                    <div class="p-4 w-2/3">
                        <h3 class="text-lg font-semibold mb-2">
                            <a href="<?php the_permalink(); ?>" class="text-blue-600 hover:text-blue-800"><?php the_title(); ?></a>
                        </h3>
                        <div class="text-sm text-gray-600 mb-2"><?php echo get_the_date(); ?></div>
                        <div class="prose max-w-none"><?php echo wp_trim_words(get_the_excerpt(), 15); ?></div>
                    </div>
                </article>
            <?php
            endwhile;
            wp_reset_postdata();
            ?>
        </div>
    </section>
<!-- </div> -->

<?php get_footer(); ?>
