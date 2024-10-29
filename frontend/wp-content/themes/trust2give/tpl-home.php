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
    <div class="py-8 w-full bg-indigo-500 text-center text-white">
        <?php
            $post_query = new WP_Query([
                'name' => 'luttons',
                'post_type' => 'post',
                'post_status' => 'publish',
                'posts_per_page' => 1
            ]);
            
            if ($post_query->have_posts()) {    
                while ($post_query->have_posts()) : $post_query->the_post();
                    the_content();
                endwhile;
                wp_reset_postdata();
            }
        ?>
    </div>
    <div class="w-full sm:w-3/5 sm:mx-auto min-h-20 bg-world py-8 text-center shadow-lg py-36">
        <span class="text-green text-4xl font-bold">Où en sommes nous aujourd'hui ?</span>
        <div class="text-green text-xl font-bold">
            <ul class="flex align-items-center mt-8">
                <li class="flex flex-col w-1/3">
                    <span>36.3MD</span>
                    <span>d'emission mondiale de CO²</span>
                </li>
                <li class="flex flex-col w-1/3">
                    <span>110</span>
                    <span>partenaires</span>
                </li>
                <li class="flex flex-col w-1/3">
                    <span>+1.5°C</span>
                    <span>d'ici 2023</span>
                </li>
            </ul>
        </div>
    </div>
    <div class="py-8 w-full bg-clear-green text-center text-white">
        <?php
            $post_query = new WP_Query([
                'name' => 'il-etait-une-fois-trust2give',
                'post_type' => 'post',
                'post_status' => 'publish',
                'posts_per_page' => 1
            ]);
            
            if ($post_query->have_posts()) {    
                while ($post_query->have_posts()) : $post_query->the_post();
                    the_content();
                endwhile;
                wp_reset_postdata();
            }
        ?>
    </div>
<?php get_footer(); ?>
