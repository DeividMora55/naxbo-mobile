import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { getNotifications, markNotification } from '@/api';
import { Card, Empty, Screen, Title } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';

export default function NotificationsScreen(){
  const{palette}=useTheme();
  const[data,setData]=useState<any[]>([]);
  const[count,setCount]=useState(0);
  const[loading,setLoading]=useState(true);
  const load=useCallback(async()=>{
    try{
      const x=await getNotifications();
      setData(x.notifications);setCount(x.unread_count);
    }finally{setLoading(false)}
  },[]);
  useEffect(()=>{void load()},[load]);
  return <Screen>
    <Title subtitle={`${count} sin leer`}>Notificaciones</Title>
    {!loading&&data.length===0?<Empty icon="notifications-outline" title="Todo al día" text="Aquí aparecerán cambios en solicitudes, mensajes, finalizaciones y verificaciones."/>:data.map(n=><Card key={n.id}><View style={{flexDirection:'row',gap:12}}><Text style={{fontSize:22}}>{n.leida?'○':'●'}</Text><View style={{flex:1,gap:5}}><Text style={{color:palette.text,fontWeight:'900'}}>{n.titulo}</Text>{n.mensaje?<Text style={{color:palette.muted,lineHeight:20}}>{n.mensaje}</Text>:null}<Text style={{color:palette.muted,fontSize:12}}>{n.fecha}</Text>{!n.leida?<Text onPress={async()=>{await markNotification(n.id);void load()}} style={{color:palette.primary,fontWeight:'800'}}>Marcar como leída</Text>:null}</View></View></Card>)}
  </Screen>;
}
