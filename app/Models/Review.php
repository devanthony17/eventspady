<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'organization_id',
        'user_id',
        'event_id',
        'message',
        'rate',
        'status',        
    ];    
    protected $table = 'review';

    protected $appends = ['user','event'];
    public function getUserAttribute()
    {
        return AppUser::find($this->attributes['user_id'],['id','name','last_name','image','email'])->setAppends([]);
    }
    public function getEventAttribute()
    {
        return Event::find($this->attributes['event_id'],['id','name'])->setAppends([]);
    }

}
