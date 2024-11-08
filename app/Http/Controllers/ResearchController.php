<?php

namespace App\Http\Controllers;

use App\Models\Research;
use App\Models\Author;
use App\Models\Keyword;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Inertia\Inertia;


class ResearchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Research', [
            'research_data' => Research::all(),
            'author_list' => Research::getAllAuthors(),
            'keyword_list' => Keyword::getAllKeywords(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // dd($request->all());

        $validatedData = $request->validate([
            'research_title' => 'required',
            'research_field' => 'nullable',
            'research_date' => 'nullable',
            'researcher_ids' => 'nullable',
            'research_adviser' => 'nullable',
            'research_grade' => 'nullable',
            'keywords' => 'nullable',
            'file_url' => 'nullable',
        ]);
        try {
            $research = Research::create($validatedData);

            return Redirect::back()->with('success', 'Research created successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Error creating research: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Research $research)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Research $research)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'research_title' => 'required',
            'research_field' => 'nullable',
            'research_date' => 'nullable',
            'researcher_ids' => 'nullable',
            'research_adviser' => 'nullable',
            'research_grade' => 'nullable',
            'keywords' => 'nullable',
            'file_url' => 'nullable',
        ]);

        try {
            if (!empty($request->input('new_authors'))) {
                $newAuthors = array_map('trim', explode(',', $request->input('new_authors')));

                foreach ($newAuthors as $newAuthor) {
                    Author::create(['full_name' => $newAuthor]);
                }

                $newAuthorIds = Author::whereIn('full_name', $newAuthors)->pluck('id')->toArray();
                $researchID = implode(", ", $newAuthorIds);

                $validatedData['researcher_ids'] = $validatedData['researcher_ids'] ? "{$validatedData['researcher_ids']}, {$researchID}" : $researchID;
            }

            $research = Research::find($request->id);

            // dd($validatedData);

            $research->update($validatedData);

            return Redirect::back()->with('success', 'Research updated successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Error updating research: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Research $research)
    {
        // dd($request->all());
        try {
            Research::destroy($request->id);

            return redirect()->back()->with('success', 'Research deleted successfully');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Error deleting research: ' . $e->getMessage());
        }
    }
}
