<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Research extends Model
{
    protected $fillable = [
        'research_title',
        'research_field',
        'research_date',
        'researcher_ids',
        'research_adviser',
        'research_grade',
        'keywords',
        'file_url',
    ];

    public function author()
    {
        return $this->belongsToMany(Author::class);
    }

    public static function getAllAuthors()
    {
        $data = DB::table('authors')
            ->select(
                'authors.*'
            )
            ->get();
        return $data;
    }

    // public static function getAllResearchs()
    // {
    //     $data = DB::table('researches')
    //         ->leftJoin('authors', 'authors.id', '=', 'researches.author_id')
    //         ->select(
    //             'researches.*',
    //         )
    //         ->orderBy('employee.name_emp');
    //     return $data;
    // }
}
