import React from 'react';
import Page_1 from "./home_page_content/page_1.jsx"
import Page_2 from './home_page_content/page_2.jsx';


export default function Homepage(){
    return(
      <div className=' w-screen h-max '>
        <Page_1/>
        <Page_2/>
      </div>
    )
};