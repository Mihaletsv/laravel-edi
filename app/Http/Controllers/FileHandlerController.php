<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Auth;

class FileHandlerController extends HomeController
{
    public function onUploadFile(Request $request)  {
        $file = $request->file('file_upload');
        $fileName = $file->getClientOriginalName();
        $fileBody = file_get_contents($file->getRealPath());
        $this->docfilesTable->intOwnerId = Auth::id();
        $this->docfilesTable->varFileName = $fileName;
        $this->docfilesTable->varFileBody = base64_encode($fileBody);
        $this->docfilesTable->save();
        return redirect('home');
    }

    public function onDownloadFile(Request $request)  {

    }

    public function onBrowseFile($fileid)  {
        $file_data = $this->docfilesTable->getDocById($fileid);
        if (empty($file_data)) {
            echo "File not found";
        }
        else
        {
            $file_data = $file_data->toArray();
        }
        $fileContent = $file_data['varFileBody'];
        $fileContentDecoded = base64_decode($fileContent);
        unset($fileContent);
        if (!empty($file_data)) {
            $ext = $this->getFileExt($file_data['varFileName']);
            if ($ext == 'pdf') {
                header('Content-Type: application/pdf');
            } else {
                header('Content-Type: image');
            }
            echo $fileContentDecoded;
            die;
        }


}

    private function getFileExt($filename)
    {
        $temp = explode('.', $filename);

        return strtolower(end($temp));
    }
}
