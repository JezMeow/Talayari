<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    protected $fillable = [
        'full_name',
        'first_name',
        'middle_name',
        'last_name',
        'suffix_name',
    ];

    public function research()
    {
        return $this->hasMany(Research::class);
    }
}
