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
    <div class="flex items-center w-full bg-indigo-500 text-center text-white h-48 text-xl">
        <div class="w-full sm:w-2/5 mx-auto">
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
    </div>
    <div class="w-full sm:w-3/5 sm:mx-auto bg-world py-24 text-center shadow-lg h-96 font-bold">
        <span class="text-green text-4xl">Où en sommes nous aujourd'hui ?</span>
        <div class="text-green text-2xl">
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
    <div class="py-8 w-full bg-clear-green text-black ">
        <div class="flex flew-col sm:flex-row w-full sm:w-3/5 sm:mx-auto space-x-[20px]">
            <div class="w-full sm:w-1/2">
                <?php
                    $post_query = new WP_Query([
                        'name' => 'il-etait-une-fois-trust2give',
                        'post_type' => 'post',
                        'post_status' => 'publish',
                        'posts_per_page' => 1
                    ]);
                    
                    if ($post_query->have_posts()) {    
                        while ($post_query->have_posts()) : $post_query->the_post(); ?>
                            <h2 class="text-center text-2xl text-green mb-10"><?php echo the_title(); ?></h2>
                            <?php echo the_content(); ?>
                        <?php endwhile;
                        wp_reset_postdata();
                    }
                ?>
                <br>
                <div class="text-right">
                    <a class="py-2 px-6 border-solid border-2 bg-green text-white rounded-xl" href="#">
                        En savoir plus
                    </a>
                </div>
                
            </div>
            <div class="w-full sm:w-1/2 relative h-[20rem]">
                <!-- <div class="flex"> -->
                    <img src="<?php echo bloginfo('template_url'); ?>/assets/img/team.png" alt="team" width="300" class="absolute top-0 right-0">
                    <img src="<?php echo bloginfo('template_url'); ?>/assets/img/don.png" alt="don" width="180" class="absolute bottom-0">
                <!-- </div> -->
            </div>
        </div>
    </div>
    <div class=" w-full sm:w-3/5 sm:mx-auto">
        <ul class="flex flex-col sm:flex-row justify-between text-center">
            <li class="shadow-lg sm:w-64 p-4">
                <img class="mx-auto mb-2" src="<?php echo bloginfo('template_url'); ?>/assets/img/oeil.png" width="70" alt="">
                <h3>Transparence</h3>
                <p class="text-sm">
                    TransparenceLorem ipsum dolor sit amet, consectetur adipiscing elit, 
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            <li class="shadow-lg sm:w-64 p-4">
                <img class="mx-auto mb-2" src="<?php echo bloginfo('template_url'); ?>/assets/img/cadenas.png" width="70" alt="">
                <h3>Intégrité</h3>
                <p class="text-sm">
                    TransparenceLorem ipsum dolor sit amet, consectetur adipiscing elit, 
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            <li class="shadow-lg sm:w-64 p-4">
                <img class="mx-auto " src="<?php echo bloginfo('template_url'); ?>/assets/img/impact.png" width="60" alt="">
                <h3>Impact</h3>
                <p class="text-sm">
                    TransparenceLorem ipsum dolor sit amet, consectetur adipiscing elit, 
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </li>
        </ul>
    </div>
<?php get_footer(); ?>
