import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getAdminDashboard } from '@/api';
import { ApiError } from '@/api/client';
import { Badge, Button, Card, Screen, Title } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';

export default function Dashboard(){
  const {palette}=useTheme();
  const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(false);
  async function load(){setLoading(true);try{setData(await getAdminDashboard())}catch(e){Alert.alert('Administración',e instanceof ApiError?e.message:'No se pudo cargar el resumen.')}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  const users=data?.users??{}, req=data?.requests??{}, pay=data?.payments??{};
  return <Screen>
    <Title subtitle="Control central de usuarios, solicitudes, pagos, verificaciones y moderación.">Administración</Title>
    <View style={{flexDirection:'row',gap:10,flexWrap:'wrap'}}>
      <Card><Text style={{color:palette.muted}}>Usuarios</Text><Text style={{color:palette.text,fontWeight:'900',fontSize:25}}>{Number(users.total??0)}</Text><Text style={{color:palette.muted}}>{Number(users.clientes??0)} clientes · {Number(users.trabajadores??0)} profesionales</Text></Card>
      <Card><Text style={{color:palette.muted}}>Servicios activos</Text><Text style={{color:palette.text,fontWeight:'900',fontSize:25}}>{Number(req.activos??0)}</Text><Text style={{color:palette.muted}}>{Number(req.completados??0)} completados</Text></Card>
      <Card><Text style={{color:palette.muted}}>Pagos confirmados</Text><Text style={{color:palette.text,fontWeight:'900',fontSize:25}}>${Number(pay.pagado??0).toLocaleString('es-MX')}</Text><Text style={{color:palette.muted}}>{Number(pay.movimientos??0)} movimientos</Text></Card>
    </View>
    <Card><Text style={{color:palette.text,fontWeight:'900',fontSize:18}}>Pendientes de atención</Text><View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}><Badge text={`${Number(data?.pending_verifications??0)} verificaciones`} tone={Number(data?.pending_verifications??0)>0?'warning':'success'}/><Badge text={`${Number(data?.open_reports??0)} reportes`} tone={Number(data?.open_reports??0)>0?'danger':'success'}/><Badge text={`${Number(users.suspendidos??0)} suspendidos`} tone={Number(users.suspendidos??0)>0?'warning':'info'}/></View></Card>
    <Title>Herramientas</Title>
    <View style={{gap:10}}>
      <Button title="Solicitudes y servicios" icon="clipboard-outline" variant="secondary" onPress={()=>router.push('/admin/requests')}/>
      <Button title="Pagos y transacciones" icon="card-outline" variant="secondary" onPress={()=>router.push('/admin/payments')}/>
      <Button title="Moderación de reseñas" icon="star-outline" variant="secondary" onPress={()=>router.push('/admin/reviews')}/>
      <Button title="Auditoría administrativa" icon="document-text-outline" variant="secondary" onPress={()=>router.push('/admin/audit')}/>
      <Button title="Estado del sistema" icon="pulse-outline" variant="secondary" onPress={()=>router.push('/admin/system')}/>
    </View>
    <Title subtitle="Últimos movimientos de servicio">Actividad reciente</Title>
    {(data?.recent_requests??[]).map((r:any)=><Card key={r.id}><View style={{flexDirection:'row',justifyContent:'space-between',gap:8,alignItems:'center'}}><Text style={{color:palette.text,fontWeight:'900',flex:1}}>#{r.id} · {r.servicio}</Text><Badge text={r.estado} tone={r.estado==='completado'?'success':r.estado==='cancelado'?'danger':'info'}/></View><Text style={{color:palette.muted}}>{r.cliente}{r.trabajador?` → ${r.trabajador}`:''}</Text><Text style={{color:palette.muted}}>Pago: {r.estado_pago}</Text><Button title="Abrir solicitud" variant="ghost" onPress={()=>router.push(`/admin/request/${r.id}`)}/></Card>)}
    <Button title="Actualizar resumen" loading={loading} icon="refresh-outline" variant="ghost" onPress={load}/>
  </Screen>
}
