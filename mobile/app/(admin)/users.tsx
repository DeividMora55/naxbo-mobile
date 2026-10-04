import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getAdminUsers } from '@/api';
import { ApiError } from '@/api/client';
import { Avatar, Badge, Button, Card, Empty, Field, Screen, Title } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';

const roles=['','cliente','trabajador','admin'];
export default function Users(){
 const {palette}=useTheme(); const[q,setQ]=useState(''); const[role,setRole]=useState(''); const[items,setItems]=useState<any[]>([]); const[loading,setLoading]=useState(false);
 async function load(){setLoading(true);try{const r=await getAdminUsers({q,tipo:role});setItems(r.items??[])}catch(e){Alert.alert('Usuarios',e instanceof ApiError?e.message:'No se pudo cargar.')}finally{setLoading(false)}}
 useEffect(()=>{load()},[role]);
 return <Screen><Title subtitle="Busca cuentas, revisa actividad y suspende o reactiva usuarios.">Usuarios</Title><Field label="Buscar" value={q} onChangeText={setQ} placeholder="Nombre, correo o teléfono" returnKeyType="search" onSubmitEditing={load}/><View style={{flexDirection:'row',gap:7,flexWrap:'wrap'}}>{roles.map(r=><Pressable key={r||'todos'} onPress={()=>setRole(r)} style={{borderWidth:1,borderColor:role===r?palette.primary:palette.border,backgroundColor:role===r?palette.surface2:palette.surface,borderRadius:99,paddingHorizontal:12,paddingVertical:7}}><Text style={{color:role===r?palette.primary:palette.text,fontWeight:'800'}}>{r||'Todos'}</Text></Pressable>)}</View><Button title="Buscar usuarios" loading={loading} icon="search-outline" onPress={load}/>{items.length?items.map(u=><Card key={u.id}><View style={{flexDirection:'row',gap:12,alignItems:'center'}}><Avatar uri={u.foto_url} name={u.nombre}/><View style={{flex:1,gap:4}}><Text style={{color:palette.text,fontWeight:'900',fontSize:17}}>{u.nombre} {u.apellidos}</Text><Text style={{color:palette.muted}}>{u.email}</Text><View style={{flexDirection:'row',gap:6,flexWrap:'wrap'}}><Badge text={u.tipo} tone="info"/><Badge text={u.estado_cuenta} tone={u.estado_cuenta==='activo'?'success':'danger'}/>{u.tipo==='trabajador'?<Badge text={u.verificacion_estado} tone={u.verificado?'success':'warning'}/>:null}</View></View></View><Text style={{color:palette.muted}}>{Number(u.total_solicitudes??0)} solicitudes relacionadas</Text><Button title="Ver expediente" variant="ghost" icon="open-outline" onPress={()=>router.push(`/admin/user/${u.id}`)}/></Card>):<Empty icon="people-outline" title="Sin resultados" text="No hay usuarios que coincidan con el filtro."/>}</Screen>
}
