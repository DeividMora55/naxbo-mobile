import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { getWorkers } from '@/api';
import { Empty, Field, Screen, Title } from '@/components/ui';
import { WorkerCard } from '@/components/WorkerCard';
import type { Worker } from '@/types/api';

export default function Search(){
  const params=useLocalSearchParams<{q?:string}>();
  const initial=typeof params.q==='string'?params.q:'';
  const[q,setQ]=useState(initial);
  const[workers,setWorkers]=useState<Worker[]>([]);
  const[loading,setLoading]=useState(false);
  async function load(value=q){setLoading(true);try{setWorkers(await getWorkers(value?`q=${encodeURIComponent(value)}`:''))}finally{setLoading(false)}}
  useEffect(()=>{void load(initial)},[initial]);
  return <Screen><Title subtitle="Solo aparecen profesionales verificados y activos. Busca por especialidad, nombre o ubicación.">Buscar profesionales</Title><Field label="Buscar" placeholder="Electricista, plomería, ciudad…" value={q} onChangeText={v=>{setQ(v);if(v.length===0)void load('')}} onSubmitEditing={()=>void load()}/>{!loading&&workers.length===0?<Empty icon="search-outline" title="Sin resultados" text="Prueba otra profesión, categoría o ubicación."/>:workers.map(w=><WorkerCard key={w.id} worker={w} onPress={()=>router.push(`/professional/${w.id}`)}/>)}</Screen>;
}
