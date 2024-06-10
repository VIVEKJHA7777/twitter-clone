import { useMutation,useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast';

const UseFollow = ()=>{
   const queryClient = useQueryClient();

   const { mutate:follow, isPending,error } = useMutation({
    mutationFn: async (userId)=>{
     try{
       const res = await fetch(`/api/users/follow/${userId}`,{
        method: 'POST',

       })
       const data = await res.json();
       if(!res.ok){
        throw new Error(error.message || "something went wrong");
       }
       return data;
     }
     catch(error){
       throw new Error(error.message);
     }
    },
    onSuccess:()=>{
        //Re render the suggested users.......
    Promise.all([
       queryClient.invalidateQueries({queryKey:['suggestedUsers']}),
     queryClient.invalidateQueries({queryKey:['authUser']}),
    ]);  
    },
    onError:(error)=>{
     toast.error(error.message);
    }
   })

   return {follow, isPending};
}
export default UseFollow;