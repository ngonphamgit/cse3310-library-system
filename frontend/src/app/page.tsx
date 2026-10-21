import //this is just the home page, it automaticlaly redirects to the login screen
{ 
  redirect 
} 
from "next/navigation";

export default function Home() 
{
  redirect("/login");
}