<template>
    <div>
        <nav class="d-flex align-items-center justify-content-end px-4 py-2">
            <div class="input-container d-flex align-items-center m-0">
                <icon-search width="20px" height="15px" class="me-2"/>
                <input type="text" placeholder="Search" class="w-100">
            </div>
            
            <ul class="row m-0">
                <li class="col nav-icon mx-1"><icon-setting width="20" height="20"/></li>
            </ul>
        </nav>
        <hr class="text-muted m-0" />
    </div>
</template>

<style lang="scss" scoped>
    .input-container {
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
        width: 100%;
        /* position: absolute;
        left: 0; */
        color: #F4F1F1;
        border: 2px solid #e4e1e1;
    }

    .nav-icon {
        display: grid;
        place-content: center;

        background: #F4F1F1;
        border-radius: 50%;

        aspect-ratio: 1;
        cursor: pointer;

        &:hover {
            background: #eeebeb;
        }
    }
</style>
