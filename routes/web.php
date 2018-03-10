<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
Здесь вы можете зарегистрировать веб-маршруты для своего приложения. Эти
| маршруты загружаются RouteServiceProvider.
*/


Route::get('/', function () {;
    return view('startpage');
});
Auth::routes();
Route::get('/home', 'HomeController@index')->name('home');
Route::get('/home/docs/{type}', 'DocController@index')->name('docs');
Route::post('/home/uploadfile','FileHandlerController@onuploadfile')->name('uploadfile');
Route::get('/home/uploadfile', function () {
    return redirect()->route('home');
});
Route::get('/home/downloadfile/{file_id}','FileHandlerController@ondownloadfile')->name('downloadfile');

Route::get('/home/doc/{file_id}','FileController@index')->name('displaydoc');
Route::get('/home/doc/{file_id}/browse/true','FileHandlerController@onbrowsefile')->name('browsefile');
Route::post('/home/senddoc/{file_id}', 'DocController@onsenddoc')->name('senddoc');
Route::post('/home/doc/getaccess', 'DocController@ongetaccess')->name('getaccess');
Route::get('/home/doc/getaccess', function () {
    return redirect()->route('home');
});
Route::post('/home/createaccess/{file_id}', 'DocController@oncreateaccess')->name('createaccess');
Route::get('/home/createaccess/', function () {
    return redirect()->route('home');
});