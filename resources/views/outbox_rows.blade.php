@foreach($docs as $doc)
<tr docid="{{$doc->id}}">
   <td></td>
    <td  title="Открыть документ" onclick="window.location.href='{{route('displaydoc',$doc->file_id)}}'; return false" class="fcol">
        {{$doc->varDocName}}</td>
   <td title="Получатель">{{$doc->varUser}}({{$doc->varUserEmail}})</td>
    <td  class="lcol" title="дата отправки"></a>{{$doc->created_at->format('d.m.Y H:i:s')}}</td>
</tr>
@endforeach
