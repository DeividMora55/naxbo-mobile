import { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { router } from 'expo-router';
import { getAdminAudit } from '@/api';
import { ApiError } from '@/api/client';
import { Button, Card, Empty, Screen, Title } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
export default function Audit(){const{palette}=useTheme();const[items,setItems]=useState<any[]>([]);async function load(){try{const r=await getAdminAudit();setItems(r.items??[])}catch(e){Alert.alert('Auditoría',e instanceof ApiError?e.message:'No se pudo cargar.')}}useEffect(()=>{load()},[]);return <Screen><Button title="Volver al panel" variant="ghost" icon="arrow-back" onPress={()=>router.back()}/><Title subtitle="Registro de acciones administrativas sensibles.">Auditoría</Title>{items.length?items.map(a=><Card key={a.id}><Text style={{color:palette.text,fontWeight:'900'}}>{a.accion}</Text><Text style={{color:palette.muted}}>{a.admin_nombre||'Administrador'} · {a.fecha}</Text><Text style={{color:palette.text}}>{a.descripcion||'Sin descripción'}</Text><Text style={{color:palette.muted}}>{a.entidad_tipo}{a.entidad_id?` #${a.entidad_id}`:''}</Text></Card>):<Empty icon="document-text-outline" title="Sin auditoría" text="Todavía no hay acciones administrativas registradas."/>}</Screen>}
