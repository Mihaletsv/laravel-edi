@foreach($docs as $doc)
<tr docid="{{$doc->id}}">
   <td></td>
    <td  title="Открыть документ" onclick="window.location.href='{{route('displaydoc',['file_id'=>$doc->file_id,'doc_id'=>$doc->id])}}'; return false" class="fcol">
        {{$doc->varDocName}}</td>
   <td title="Получатель">{{$doc->varUser}}({{$doc->varUserEmail}})</td>
    <td class="text-success sbold">
        @if($doc->sign_id)
            Подписан
        @endif
    </td>
    <td  class="lcol" title="дата отправки"></a>{{$doc->updated_at->format('d.m.Y H:i:s')}}</td>
</tr>
@endforeach
