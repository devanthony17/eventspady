<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InitialDataSeeder extends Seeder
{
    public function run()
    {
        // Seed a default USD currency row
        if (DB::table('currency')->count() === 0) {
            DB::table('currency')->insert([
                'country'   => 'United States',
                'currency'  => 'US Dollar',
                'symbol'    => '$',
                'code'      => 'USD',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed a default general settings row (id = 1)
        if (DB::table('general_settng')->count() === 0) {
            DB::table('general_settng')->insert([
                'app_name'         => 'Eventspady',
                'email'            => 'admin@eventspady.com',
                'currency'         => 'USD',
                'timezone'         => 'UTC',
                'footer_copyright' => '© ' . date('Y') . ' Eventspady. All rights reserved.',
                'primary_color'    => '#6366f1',
                'language'         => 'en',
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);
        }
    }
}
