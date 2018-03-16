<?php

namespace App\Http\Controllers;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use App\Doc;
use App\Sign;
use App\File;
use ZipArchive;
use Auth;

class FileHandlerController extends Controller
{
    /**
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function onUploadFile(Request $request)  {
        $this->validate($request, [
            'file_upload' => 'mimes:pdf|between:0,10000'
        ]);
        $file = $request->file('file_upload');
        $fileName = $file->getClientOriginalName();
        $fileBody = file_get_contents($file->getRealPath());
        $file_data = new File;
        $file_data->user_id = Auth::id();
        $file_data->varFileName = $fileName;
        $file_data->varFileBody = base64_encode($fileBody);
        $file_data->save();
        flash()->info('Файл добавлен');
        return redirect('home');
    }

    /**
     * @param $file_id
     */
    public function onBrowseFile($file_id)  {
        $file_data = File::findOrFail($file_id);
        $fileContent = $file_data->varFileBody;
        $fileContentDecoded = base64_decode($fileContent);
        unset($fileContent);
        if (!empty($file_data)) {
                header('Content-Type: application/pdf');
            echo $fileContentDecoded;
            die;
        }
}

    /**
     * @param Request $request
     */
    public function onDownloadFile(Request $request)
    {
        $file = File::findOrFail($request->file_id);
        if (!empty($request->doc_id)) {
            $doc = $file->docs()->where('id', $request->doc_id)->first();
            if (empty($doc))
            {
                throw new ModelNotFoundException;
            }
            if (!empty($doc->sign))
                $this->downloadZip($file, $doc->sign);
        }
        $this->downloadPdf($file);

            //return response()->download($realpath);
    }

    /**
     * @param File $file
     */
    private function downloadPdf(File $file)
    {
        $fileContentDecoded = base64_decode($file->varFileBody);
        $fileName = $file->varFileName;
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename=' . $fileName);
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        echo $fileContentDecoded;
        die;
    }

    /**
     * @param File $file
     * @param Sign $sign
     */
    private function downloadZip(File $file, Sign $sign)
    {
        $fileContentDecoded = base64_decode($file->varFileBody);
        $fileName = $file->varFileName;
        $baseName = $this->getFileNameWithoutExt($fileName);
        $signFileName = $baseName.'.bin';
        $signContentDecoded = base64_decode($sign->varSignBody);
        $zip = new ZipArchive();
        $arcFileName = $baseName.'_'.time().'.zip';
        $realpath = 'storage/'.$arcFileName;
        if ($zip->open($realpath, ZipArchive::CREATE) === true) {
            $zip->addFromString($fileName, $fileContentDecoded);
                if (strlen($signContentDecoded) > 0) {
                    $zip->addFromString($signFileName, $signContentDecoded);
                }
            $zip->close();
            chmod($realpath, 0777);
            header('Pragma: public');
            header('Expires: 0');
            header('Content-Type: application/force-download');
            header(sprintf('Content-Disposition: attachment; filename="%s"', $arcFileName));
            header('Content-Transfer-Encoding: binary');
            echo file_get_contents($realpath);
            die;
        }
    }

    /**
     *
     * @param string $filename
     * @return string
     */
    private function getFileNameWithoutExt($filename)
    {
        $fileParts = explode('.', $filename);

        if (count($fileParts) > 1) {
            array_pop($fileParts);
        }

        return implode('.', $fileParts);
    }


}
