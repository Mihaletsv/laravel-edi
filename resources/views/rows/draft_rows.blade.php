@foreach($docs as $doc)
<tr docid="{{$doc->id}}">
   <td></td>
   <td  title="Открыть документ" onclick="window.location.href='{{route('displaydoc',['file_id'=>$doc->file_id,'doc_id'=>$doc->id])}}'; return false" class="fcol">
      {{$doc->varDocName}}</td>
   <td title="Создатель">{{--{{Auth::user()->name}}({{Auth::user()->email}})--}}</td>
   <td>
      @if($doc->sign_id)
         <h5 class="text-success sbold">Подписан</h5>
      @endif
   </td>
   <td class="lcol" title="дата загрузки">{{$doc->created_at->format('d.m.Y H:i:s')}}</td>
</tr>
@endforeach
