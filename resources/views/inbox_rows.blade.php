@foreach($docs as $doc)
    <tr docid="{{$doc['id']}}">
        <td></td>
        <td  title="Открыть документ" onclick="window.location.href='{{route('displaydoc',$doc['intFileId'])}}'; return false" class="fcol">{{$doc['varDocName']}}</td>
        <td title="Отправитель">{{$doc['varUser']}}({{$doc['varUserEmail']}})</td>
        <td  class="lcol" title="дата получения"></a>{{$doc['created_at']}}</td>
    </tr>
@endforeach
