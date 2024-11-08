<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;

class Keyword extends Model
{
    protected $fillable = [
        'keyword',
    ];

    public function research()
    {
        return $this->belongsToMany(Research::class);
    }

    public static function getAllKeywords()
    {
        $data = DB::table('keywords')
            ->select(
                'keywords.*'
            )
            ->get();
        return $data;
    }

    public static function getKeyword($id)
    {
        $data = DB::table('keywords')
            ->select(
                'keywords.*'
            )
            ->where('keywords.id', '=', $id)
            ->get();
        return $data;
    }
}
