<template>
    <div>
 <nav class="d-flex align-items-center justify-content-end p-4">
        <div class="text d-flex align-items-center">
            <icon-search width="20px" height="15px" class="me-2"/>
            <input type="text" placeholder="Search" class="w-100">
        </div>
        
        <ul class="row m-0">
            <li class="col nav-icon mx-1"><icon-setting width="20" height="20"/></li>
        </ul>
    </nav>
    <hr class="text-muted">
     </div>
   
</template>

<style lang="scss" scoped>
    .text {
        background: #F4F1F1;
        border-radius: 20px;
        min-width: 30%;
        box-sizing: border-box;
        padding: 1em 1.5rem;

        input {
            font-size: .8em;
            outline: none;
            border-radius: 20px;
            background: #F4F1F1;
            border: none;
        }
    }

    hr {
        width: 100vw;
        position: absolute;
        left: 0;
        color: #F4F1F1;
        border: 2px solid #e4e1e1;
    }

    .nav-icon {
        padding: 8px 10px;
        border-radius: 50%;
        background: #F4F1F1;
        cursor: pointer;

        &:hover {
            background: #eeebeb;
        }
    }
</style>