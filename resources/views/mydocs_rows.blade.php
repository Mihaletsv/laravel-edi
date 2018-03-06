@foreach($docs as $doc)
<tr docid="{{$doc->id}}">
   <td></td>
   <td  title="Открыть документ" onclick="window.location.href='{{route('displaydoc',$doc->id)}}'; return false" class="fcol">
      {{$doc->varFileName}}</td>
   <td title="Создатель">{{$currentUser->name}}({{$currentUser->email}})</td>
   <td class="lcol" title="дата загрузки">{{$doc->created_at}}</td>
</tr>
@endforeach
