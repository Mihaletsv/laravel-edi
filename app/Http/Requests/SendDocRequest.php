<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\File;
use Illuminate\Support\Facades\Auth;

class SendDocRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        //проверяем права отправителя документа (создатель?)
/*        $file = File::select('user_id')->find($this->route('file_id'));
        return ($file->user_id == $this->user()->id);*/
    return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $email = Auth::user()->email;
        $rules = ['file_id' => 'required|integer',
            'recipient.*' => 'required|email|exists:users,email|not_in:'.$email
            //
        ];
        return $rules;
    }
}
