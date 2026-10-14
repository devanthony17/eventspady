<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $now = Carbon::now();

        // 1. Categories
        $categories = [
            ['name' => 'Music Festival', 'image' => 'category_music.png', 'status' => 1],
            ['name' => 'Tech Conference', 'image' => 'category_tech.png', 'status' => 1],
            ['name' => 'Art Exhibition', 'image' => 'category_art.png', 'status' => 1],
            ['name' => 'Sports Event', 'image' => 'category_sports.png', 'status' => 1],
            ['name' => 'Food Tasting', 'image' => 'category_food.png', 'status' => 1],
            ['name' => 'Business Workshop', 'image' => 'category_business.png', 'status' => 1],
        ];

        DB::table('category')->truncate();
        foreach ($categories as $idx => $cat) {
            DB::table('category')->insert([
                'id' => $idx + 1,
                'name' => $cat['name'],
                'image' => $cat['image'],
                'status' => $cat['status'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 2. Events
        $events = [
            [
                'name' => 'Summer Music Festival 2026', 'type' => 'offline', 'user_id' => 2, 'address' => 'Central Park, NY', 
                'category_id' => 1, 'start_time' => $now->copy()->addDays(5)->format('Y-m-d H:i:s'), 'end_time' => $now->copy()->addDays(7)->format('Y-m-d H:i:s'),
                'image' => 'event_music.png', 'people' => 5000, 'lat' => '40.7812', 'lang' => '-73.9665', 
                'description' => 'Join us for the biggest music festival of the summer!', 'status' => 1, 'event_status' => 'Published'
            ],
            [
                'name' => 'AI & Future Tech Summit', 'type' => 'online', 'user_id' => 2, 'address' => 'Online', 
                'category_id' => 2, 'start_time' => $now->copy()->addDays(10)->format('Y-m-d H:i:s'), 'end_time' => $now->copy()->addDays(11)->format('Y-m-d H:i:s'),
                'image' => 'event_2.png', 'people' => 1000, 'lat' => '', 'lang' => '', 
                'description' => 'Explore the future of Artificial Intelligence with leading experts.', 'status' => 1, 'event_status' => 'Published'
            ],
            [
                'name' => 'Modern Art Expo', 'type' => 'offline', 'user_id' => 2, 'address' => 'Louvre Museum, Paris', 
                'category_id' => 3, 'start_time' => $now->copy()->addDays(15)->format('Y-m-d H:i:s'), 'end_time' => $now->copy()->addDays(20)->format('Y-m-d H:i:s'),
                'image' => 'event_3.png', 'people' => 2000, 'lat' => '48.8606', 'lang' => '2.3376', 
                'description' => 'A unique exhibition showcasing contemporary masterpieces.', 'status' => 1, 'event_status' => 'Published'
            ],
            [
                'name' => 'City Marathon 2026', 'type' => 'offline', 'user_id' => 2, 'address' => 'Downtown Metro', 
                'category_id' => 4, 'start_time' => $now->copy()->addDays(25)->format('Y-m-d H:i:s'), 'end_time' => $now->copy()->addDays(25)->format('Y-m-d H:i:s'),
                'image' => 'event_4.png', 'people' => 10000, 'lat' => '34.0522', 'lang' => '-118.2437', 
                'description' => 'Annual city marathon. Run for a cause!', 'status' => 1, 'event_status' => 'Published'
            ],
            [
                'name' => 'Gourmet Food Tasting', 'type' => 'offline', 'user_id' => 2, 'address' => 'The Grand Hotel', 
                'category_id' => 5, 'start_time' => $now->copy()->addDays(30)->format('Y-m-d H:i:s'), 'end_time' => $now->copy()->addDays(30)->format('Y-m-d H:i:s'),
                'image' => 'event_5.png', 'people' => 300, 'lat' => '51.5074', 'lang' => '-0.1278', 
                'description' => 'Taste exquisite dishes prepared by Michelin-starred chefs.', 'status' => 1, 'event_status' => 'Published'
            ],
            [
                'name' => 'Startup Founders Workshop', 'type' => 'offline', 'user_id' => 2, 'address' => 'Tech Hub Center', 
                'category_id' => 6, 'start_time' => $now->copy()->addDays(35)->format('Y-m-d H:i:s'), 'end_time' => $now->copy()->addDays(36)->format('Y-m-d H:i:s'),
                'image' => 'event_6.png', 'people' => 150, 'lat' => '37.7749', 'lang' => '-122.4194', 
                'description' => 'Learn how to scale your business from zero to one.', 'status' => 1, 'event_status' => 'Published'
            ],
        ];

        DB::table('events')->truncate();
        foreach ($events as $idx => $event) {
            DB::table('events')->insert([
                'id' => $idx + 1,
                'name' => $event['name'],
                'type' => $event['type'],
                'user_id' => $event['user_id'],
                'address' => $event['address'],
                'category_id' => $event['category_id'],
                'start_time' => $event['start_time'],
                'end_time' => $event['end_time'],
                'image' => $event['image'],
                'people' => $event['people'],
                'lat' => $event['lat'],
                'lang' => $event['lang'],
                'description' => $event['description'],
                'security' => 1,
                'status' => $event['status'],
                'event_status' => $event['event_status'],
                'is_deleted' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 3. Blogs
        $blogs = [];
        for ($i = 1; $i <= 6; $i++) {
            $blogs[] = [
                'id' => $i,
                'category_id' => $i,
                'title' => "Blog Post Title $i: Tips and Tricks",
                'description' => "This is a detailed blog post description for post $i. It contains many interesting facts about the event industry and how to manage large crowds effectively.",
                'image' => "blog_$i.png",
                'tags' => "event, tips, guide",
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('blog')->truncate();
        foreach ($blogs as $blog) {
            DB::table('blog')->insert($blog);
        }

        // 4. Banners
        $banners = [];
        for ($i = 1; $i <= 6; $i++) {
            $banners[] = [
                'id' => $i,
                'title' => "Featured Slider $i",
                'description' => "Discover the most amazing events happening around you. Join us today!",
                'image' => "banner_$i.png",
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('banner')->truncate();
        foreach ($banners as $banner) {
            DB::table('banner')->insert($banner);
        }
    }
}
